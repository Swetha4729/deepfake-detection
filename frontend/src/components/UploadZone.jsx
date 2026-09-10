import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Headphones, UploadCloud } from 'react-feather'

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
        <CardTitle className="text-lg">Audio Input</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`animate-fade-up dropzone-dashed group cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-all duration-200 ${
            isDragActive ? 'border-primary bg-primary/5 scale-[1.01]' : 'hover:border-primary/60 hover:bg-primary/[0.02]'
          }`}
        >
          <input {...getInputProps()} id="audio-file-input" />
          <div className={`bg-primary/10 text-primary animate-float mx-auto mb-4 flex size-14 items-center justify-center rounded-full transition-transform duration-200 ${isDragActive ? 'scale-110' : 'group-hover:scale-105'}`}>
            <UploadCloud className="size-7" />
          </div>
          <h3 className="text-base font-semibold">
            {isDragActive ? 'Drop the file now…' : 'Drop an audio file here'}
          </h3>
          <p className="text-muted-foreground mt-1 text-sm">…or click to browse your device</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {FORMATS.map((f) => (
              <Badge key={f} variant="secondary">
                {f}
              </Badge>
            ))}
          </div>
          <Button
            type="button"
            className="group/btn mt-6"
            onClick={(e) => {
              e.stopPropagation()
              open()
            }}
          >
            <Headphones className="size-4 transition-transform duration-200 group-hover/btn:-translate-y-0.5" />
            Browse Files
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}