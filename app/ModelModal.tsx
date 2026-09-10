'use client'

import { Button } from '@/components/ui/button'
import { 
  Card,
  CardHeader,
  CardContent } from '@/components/ui/card'
import { useState, useEffect } from 'react';
import { type ProviderId, type Role } from './providers'
import ModelPicker from './ModelPicker'

export type ModelChoice = {
  provider: ProviderId
  model: string
}

export type ModelConfig = {
  llm: ModelChoice
  embedding: ModelChoice
  apiKey: string
}

type ModelModalProps = {
  onClose: () => void
  onSubmit: (config: ModelConfig) => void
}


export default function ModelModal({ onClose, onSubmit }: ModelModalProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [llm, setLlm] = useState<ModelChoice>({ provider: "ollama", model: "" })
  const [embedding, setEmbedding] = useState<ModelChoice>({ provider: "ollama", model: ""})
  const [apiKey, setApiKey] = useState('')
  const [ollamaModels, setOllamaModels] = useState<string[]>([])

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

  const role: Role = step === 1 ? "llm" : "embedding"
  const currentChoice = step === 1 ? llm : embedding
  const setCurrentChoice = step === 1 ? setLlm : setEmbedding

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <Card className="flex flex-col w-[20rem] max-w-[90vw] items-center gap-3 bg-white shadow-xl overflow-auto" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="flex justify-between items-center gap-6 w-full text-gray-400">
          <p className="text-black">{step === 1 ? "Step 1 of 2 - Chat Model" : "Step 2 of 2 - Embedding model"}</p>
          <Button onClick={onClose} className="cursor-pointer">✕</Button>
        </CardHeader>  
        <CardContent className='flex flex-col items-center justify-center'>
          <ModelPicker
            role={role}
            value={currentChoice}
            onChange={setCurrentChoice}
            apiKey={apiKey}
            onApiKeyChange={setApiKey}
            ollamaModels={ollamaModels}
          />
          <div className="flex gap-3 mt-6">
            {step === 2 && (
              <Button onClick={() => setStep(1)}>Back</Button>
            )}

            {step === 1 ? (
              <Button disabled={!currentChoice.model} onClick={() => setStep(2)}>Next</Button>
            ) : (
              <Button
                disabled={!currentChoice.model}
                onClick={() => {
                  onSubmit({ llm, embedding, apiKey })
                  onClose()
                }}
              >
                Finish
              </Button>
            )}
          </div>
        </CardContent>     
      </Card>
    </div>
  )
}