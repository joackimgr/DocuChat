'use client'

import { Button } from '@/components/ui/button'
import { 
  Card,
  CardHeader,
  CardContent } from '@/components/ui/card'
import { useState, useEffect } from 'react';
import { type OllamaModel, type ProviderId } from './providers'
import ModelPicker from './ModelPicker'

export type ModelChoice = {
  provider: ProviderId
  model: string
}

export type ModelConfig = {
  llm: ModelChoice
  apiKey: string
}

type ModelModalProps = {
  onClose: () => void
  onSubmit: (config: ModelConfig) => void
}


export default function ModelModal({ onClose, onSubmit }: ModelModalProps) {
  const [llm, setLlm] = useState<ModelChoice>({ provider: "ollama", model: "" })
  const [apiKey, setApiKey] = useState('')
  const [ollamaModels, setOllamaModels] = useState<OllamaModel[]>([])

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
      }
    }
    loadModels()
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <Card className="flex flex-col w-[20rem] max-w-[90vw] items-center gap-3 bg-white shadow-xl overflow-auto" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="flex justify-between items-center gap-6 w-full text-gray-400">
          <p className="text-black">Chat Model</p>
          <Button onClick={onClose} className="cursor-pointer">✕</Button>
        </CardHeader>  
        <CardContent className='flex flex-col items-center justify-center'>
          <ModelPicker
            role="llm"
            value={llm}
            onChange={setLlm}
            apiKey={apiKey}
            onApiKeyChange={setApiKey}
            ollamaModels={ollamaModels}
          />
          <div className="flex gap-3 mt-6">
              <Button
                disabled={!llm.model}
                onClick={() => {
                  onSubmit({ llm, apiKey })
                  onClose()
                }}
              >
                Finish
              </Button>
          </div>
        </CardContent>     
      </Card>
    </div>
  )
}