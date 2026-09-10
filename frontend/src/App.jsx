import { useEffect, useState } from 'react'
import axios from 'axios'
import { BarChart2, UploadCloud } from 'react-feather'

import { Dashboard } from '@/components/Dashboard'
import { Header } from '@/components/Header'
import { HistoryPanel } from '@/components/HistoryPanel'
import { ResultZone } from '@/components/ResultZone'
import { AnalyzingState, ErrorState } from '@/components/StatusViews'
import { UploadZone } from '@/components/UploadZone'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

export default function App() {
  const [tab, setTab] = useState('workspace')
  const [phase, setPhase] = useState('idle') // idle | analyzing | result | error
  const [result, setResult] = useState(null)
  const [currentFile, setCurrentFile] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [history, setHistory] = useState([])
  const [activeHistoryId, setActiveHistoryId] = useState(null)

  // Persist history across sessions so the dashboard accumulates statistics
  useEffect(() => {
    try {
      const raw = localStorage.getItem('voiceguard-history')
      if (raw) setHistory(JSON.parse(raw))
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('voiceguard-history', JSON.stringify(history))
    } catch {
      /* ignore */
    }
  }, [history])

  const handleFile = async (file) => {
    setCurrentFile(file)
    setPhase('analyzing')
    setResult(null)
    setErrorMsg('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const resp = await axios.post(`${API_BASE}/predict`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      })
      const data = resp.data
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
    } catch (err) {
      const msg =
        err.response?.data?.detail ??
        (err.code === 'ECONNABORTED'
          ? 'Request timed out. The backend may be cold-starting — try again in a moment.'
          : err.message === 'Network Error'
            ? 'Cannot reach the backend. Make sure it is running on port 8000.'
            : `Unexpected error: ${err.message}`)
      setErrorMsg(msg)
      setPhase('error')
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
    setActiveHistoryId(null)
  }

  const clearHistory = () => {
    setHistory([])
    setActiveHistoryId(null)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-5 px-4 py-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="dashboard">
              <BarChart2 className="size-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="workspace">
              <UploadCloud className="size-4" />
              Workspace
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard history={history} />
          </TabsContent>

          <TabsContent value="workspace">
            <div className="grid items-start gap-5 pt-2 lg:grid-cols-[1fr_320px]">
              <div>
                {phase === 'idle' && <UploadZone onFile={handleFile} />}
                {phase === 'analyzing' && <AnalyzingState filename={currentFile?.name ?? ''} />}
                {phase === 'result' && result && <ResultZone key={activeHistoryId} result={result} file={currentFile} onReset={reset} />}
                {phase === 'error' && <ErrorState message={errorMsg} onReset={reset} />}
              </div>

              <HistoryPanel history={history} activeId={activeHistoryId} onSelect={handleHistorySelect} onClear={clearHistory} />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* <footer className="border-t py-4">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-1 px-4 text-xs sm:flex-row">
          <span className="text-muted-foreground">VoiceGuard · ASVspoof 2019 LA · 2D-CNN</span>
          <span className="text-muted-foreground">Web demo — not for production use</span>
        </div>
      </footer> */}
    </div>
  )
}