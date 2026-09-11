import { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'sonner'

import { Dashboard } from '@/components/Dashboard'
import { Header } from '@/components/Header'
import { HistoryPanel } from '@/components/HistoryPanel'
import { LoginPage } from '@/components/LoginPage'
import { ResultZone } from '@/components/ResultZone'
import { Sidebar } from '@/components/Sidebar'
import { AnalyzingState, ErrorState } from '@/components/StatusViews'
import { UploadZone } from '@/components/UploadZone'
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet'

const API_BASE = import.meta.env.VITE_API_URL ?? '/api'
const USER_STORAGE_KEY = 'voiceguard-user'

const MAX_ATTEMPTS = 4
const RETRYABLE = ['ECONNABORTED', 'Network Error', 502, 503, 504]
const MIN_SKELETON_TIME = 1600

const VIEW_META = {
  dashboard: { title: 'Dashboard', subtitle: 'Detection statistics from your analysis session' },
  workspace: { title: 'Workspace', subtitle: 'Upload a clip to detect whether the audio is synthetic' },
}

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default function App() {
  const [user, setUser] = useState(readStoredUser)
  const [tab, setTab] = useState('workspace')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [phase, setPhase] = useState('idle')
  const [result, setResult] = useState(null)
  const [currentFile, setCurrentFile] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [history, setHistory] = useState([])
  const [activeHistoryId, setActiveHistoryId] = useState(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('voiceguard-history')
      if (raw) setHistory(JSON.parse(raw))
    } catch {
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('voiceguard-history', JSON.stringify(history))
    } catch {
    }
  }, [history])

  const handleLogin = (nextUser) => {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser))
    } catch {
    }
    setUser(nextUser)
    setTab('workspace')
  }

  const handleLogout = () => {
    try {
      localStorage.removeItem(USER_STORAGE_KEY)
    } catch {
    }
    setUser(null)
    setTab('workspace')
    setMobileNavOpen(false)
    reset()
  }

  const handleFile = async (file) => {
    setCurrentFile(file)
    setPhase('analyzing')
    setResult(null)
    setErrorMsg('')
    setAttempt(0)
    const startedAt = Date.now()

    const formData = new FormData()
    formData.append('file', file)

    for (let i = 1; i <= MAX_ATTEMPTS; i++) {
      setAttempt(i)
      try {
        const resp = await axios.post(`${API_BASE}/predict`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 150000,
        })
        const data = resp.data

        const elapsed = Date.now() - startedAt
        if (elapsed < MIN_SKELETON_TIME) {
          await new Promise((r) => setTimeout(r, MIN_SKELETON_TIME - elapsed))
        }

        setResult(data)
        setPhase('result')

        const id = crypto.randomUUID()
        const entry = {
          id,
          filename: data.filename,
          verdict: data.verdict,
          confidence: data.confidence,
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          result: data,
          file,
        }
        setHistory((prev) => [entry, ...prev])
        setActiveHistoryId(id)

        toast.success(
          data.verdict === 'spoof'
            ? 'Synthetic audio detected'
            : 'Audio verified as genuine',
          {
            description: `${data.filename} — ${data.confidence}% confidence`,
          },
        )
        return
      } catch (err) {
        const retriable =
          RETRYABLE.includes(err.code) ||
          RETRYABLE.includes(err.message) ||
          RETRYABLE.includes(err.response?.status)

        if (retriable && i < MAX_ATTEMPTS) {
          await new Promise((r) => setTimeout(r, i * 4000))
          continue
        }

        const msg =
          err.response?.data?.detail ??
          (err.code === 'ECONNABORTED'
            ? 'Request timed out. The backend may be cold-starting — try again in a moment.'
            : err.message === 'Network Error'
              ? 'Cannot reach the backend. If you are running locally, start it on port 8000.'
              : `Unexpected error: ${err.message}`)
        setErrorMsg(msg)
        setPhase('error')
        toast.error('Analysis failed', { description: msg })
        return
      }
    }
  }

  const handleHistorySelect = (id) => {
    const item = history.find((h) => h.id === id)
    if (!item) return
    setActiveHistoryId(id)
    setResult(item.result)
    setCurrentFile(item.file)
    setPhase('result')
  }

  const reset = () => {
    setPhase('idle')
    setResult(null)
    setCurrentFile(null)
    setErrorMsg('')
    setAttempt(0)
    setActiveHistoryId(null)
  }

  const clearHistory = () => {
    const count = history.length
    setHistory([])
    setActiveHistoryId(null)
    if (count > 0) toast.info(`Cleared ${count} record${count === 1 ? '' : 's'} from history`)
  }

  const navigate = (nextTab) => {
    setTab(nextTab)
    setMobileNavOpen(false)
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />
  }

  const meta = VIEW_META[tab]

  return (
    <div className="flex min-h-screen">
      <Sidebar activeTab={tab} onNavigate={navigate} />

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">Primary navigation for VoiceGuard</SheetDescription>
          <Sidebar
            activeTab={tab}
            onNavigate={navigate}
            onClose={() => setMobileNavOpen(false)}
            mobile
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          title={meta.title}
          subtitle={meta.subtitle}
          user={user}
          onLogout={handleLogout}
          onMenuClick={() => setMobileNavOpen(true)}
        />

        <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-6">
          {tab === 'dashboard' ? (
            <div className="animate-fade-in">
              <Dashboard history={history} onClearHistory={clearHistory} onSelectHistory={handleHistorySelect} />
            </div>
          ) : (
            <div className="grid items-start gap-5 lg:grid-cols-[1fr_320px]">
              <div className="animate-fade-in">
                {phase === 'idle' && <UploadZone onFile={handleFile} />}
                {phase === 'analyzing' && <AnalyzingState filename={currentFile?.name ?? ''} attempt={attempt} />}
                {phase === 'result' && result && <ResultZone key={activeHistoryId} result={result} file={currentFile} onReset={reset} />}
                {phase === 'error' && <ErrorState message={errorMsg} onReset={reset} />}
              </div>

              <HistoryPanel history={history} activeId={activeHistoryId} onSelect={handleHistorySelect} onClear={clearHistory} />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}