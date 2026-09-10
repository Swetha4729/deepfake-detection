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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Upload Audio</CardTitle>
        <span className="text-muted-foreground text-xs">First second of audio is analyzed</span>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`dropzone-dashed group cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-colors duration-200 ${
            isDragActive ? 'border-primary bg-primary/5' : 'hover:border-primary/60 hover:bg-secondary/40'
          }`}
        >
          <input {...getInputProps()} id="audio-file-input" />
          <div
            className={`text-primary bg-primary/10 mx-auto mb-4 flex size-12 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-105 ${
              isDragActive ? 'scale-105' : ''
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
      </CardContent>
    </Card>
  )
}