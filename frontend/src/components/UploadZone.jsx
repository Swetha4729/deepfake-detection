import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Headphones, Lock, UploadCloud } from 'react-feather'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const ACCEPTED = { 'audio/*': ['.wav', '.flac', '.mp3', '.ogg', '.m4a'] }
const FORMATS = ['.wav', '.flac', '.mp3', '.ogg', '.m4a']

export function UploadZone({ onFile }) {
  const onDrop = useCallback(
    (accepted) => {
      if (accepted.length > 0) onFile(accepted[0])
    },
    [onFile],
  )

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxFiles: 1,
    multiple: false,
    noClick: true,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Upload Audio</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`dropzone-dashed group cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-all duration-200 ${
            isDragActive
              ? 'border-primary bg-primary/5 shadow-[0_0_0_4px_var(--primary)/10]'
              : 'hover:border-primary/60 hover:bg-secondary/40'
          }`}
        >
          <input {...getInputProps()} id="audio-file-input" />
          <div
            className={`text-primary bg-primary/10 mx-auto mb-4 flex size-14 items-center justify-center rounded-full ring-8 ring-primary/5 transition-transform duration-200 group-hover:scale-105 ${
              isDragActive ? 'scale-110' : ''
            }`}
          >
            <UploadCloud className="size-6" />
          </div>
          <h3 className="text-base font-medium">{isDragActive ? 'Release to upload' : 'Drop an audio file here'}</h3>
          <p className="text-muted-foreground mt-1 text-sm">…or click to browse your device</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {FORMATS.map((f) => (
              <Badge key={f} variant="secondary">
                {f}
              </Badge>
            ))}
          </div>
          <Button
            type="button"
            className="mt-6"
            onClick={(e) => {
              e.stopPropagation()
              open()
            }}
          >
            <Headphones className="size-4" />
            Browse Files
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-1.5 text-muted-foreground text-xs">
          <span className="flex items-center gap-1.5">
            <UploadCloud className="size-3.5" />
            Analyzes the first second of audio
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="size-3.5" />
            Processed securely, nothing is stored server-side
          </span>
        </div>
      </CardContent>
    </Card>
  )
}