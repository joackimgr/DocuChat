'use client'

import { Button } from '@/components/ui/button'
import { 
  Card,
  CardHeader,
  CardContent } from '@/components/ui/card'
import { useState, useEffect, useRef } from 'react';
import { type OllamaModel } from './providers'
import ModelPicker from './ModelPicker'

export type ModelConfig = {
  llm: { model: string }
}

export type ProgressHandler = (done: number, total: number) => void

export type SubmitHandler = (
  config: ModelConfig,
  onProgress?: ProgressHandler
) => Promise<void> | void

type ModelModalProps = {
  onClose: () => void
  onSubmit: SubmitHandler
}


export default function ModelModal({ onClose, onSubmit }: ModelModalProps) {
  const [model, setModel] = useState('')
  const [ollamaModels, setOllamaModels] = useState<OllamaModel[]>([])
  const [isLoadingModels, setIsLoadingModels] = useState(true)
  const [isPreparing, setIsPreparing] = useState(false)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [prepareError, setPrepareError] = useState('')
  const dialogRef = useRef<HTMLDivElement>(null)

  async function handleFinish() {
    setIsPreparing(true)
    setProgress(null)
    setElapsed(0)
    setPrepareError('')

    try {
      await onSubmit({ llm: { model } }, (done, total) => setProgress({ done, total }))
      onClose()
    } catch (error) {
      console.error(error)
      setPrepareError('The document could not be prepared. Try again.')
    } finally {
      setIsPreparing(false)
    }
  }

  useEffect(() => {
    dialogRef.current?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  useEffect(() => {
    if (!isPreparing) return
    const id = setInterval(() => setElapsed((seconds) => seconds + 1), 1000)
    return () => clearInterval(id)
  }, [isPreparing])

  useEffect(() => {
    async function loadModels() {
      try {
        const res = await fetch('/api/ollama/models')
        if (!res.ok) {
          const err = await res.json()
          console.error(err.error)
          return;
        }
        const data = await res.json()
        setOllamaModels(data.models)
      } catch (error){
        console.error(error)
      } finally {
        setIsLoadingModels(false)
      }
    }
    loadModels()
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <Card
        role="dialog"
        aria-modal="true"
        aria-labelledby="model-modal-title"
        tabIndex={-1}
        ref={dialogRef}
        className="flex flex-col w-[20rem] max-w-[90vw] items-center gap-3 bg-white shadow-xl overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="flex justify-between items-center gap-6 w-full text-gray-400">
          <p id="model-modal-title" className="text-black">Chat Model</p>
          <Button onClick={onClose} aria-label="Close" className="cursor-pointer">✕</Button>
        </CardHeader>  
        <CardContent className='flex w-full flex-col items-center justify-center'>
          <ModelPicker
            value={model}
            onChange={setModel}
            ollamaModels={ollamaModels}
            isLoadingModels={isLoadingModels}
          />
          <div className="flex flex-col items-center gap-3 mt-6">
              <Button
                disabled={!model || isPreparing}
                onClick={handleFinish}
                className="cursor-pointer"
              >
                {isPreparing ? 'Preparing…' : 'Finish'}
              </Button>

              {isPreparing && (
                <div className="w-full" role="status" aria-live="polite">
                  {progress ? (
                    <>
                      <div className="flex items-baseline justify-between text-sm text-gray-600">
                        <span>
                          {progress.done >= progress.total
                            ? 'Opening the document…'
                            : 'Storing the document…'}
                        </span>
                        <span className="tabular-nums">
                          {Math.round((progress.done / progress.total) * 100)}%
                        </span>
                      </div>
                      <div
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round((progress.done / progress.total) * 100)}
                        aria-label="Storing the document"
                        className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200"
                      >
                        <div
                          className="h-full rounded-full bg-green-500 transition-[width] duration-300 motion-reduce:transition-none"
                          style={{ width: `${(progress.done / progress.total) * 100}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        {progress.done} of {progress.total} passages
                        {elapsed > 0 ? ` — ${elapsed}s` : ''}
                        {progress.total > 300 && progress.done < progress.total
                          ? ' — large documents take a few minutes'
                          : ''}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Reading the pages and storing what they mean…
                    </p>
                  )}
                </div>
              )}

              {prepareError && (
                <p role="alert" className="text-sm text-red-500">{prepareError}</p>
              )}
          </div>
        </CardContent>     
      </Card>
    </div>
  )
}