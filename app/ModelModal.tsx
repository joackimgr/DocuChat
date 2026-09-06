'use client'

import { Button } from '@/components/ui/button'
import { 
  Card,
  CardHeader,
  CardContent } from '@/components/ui/card'
import { Field, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from '@/components/ui/input'
import { useState } from 'react';

export type ModelChoice = {
  provider: "openai" | "ollama"
  model: string
}

export type ModelConfig = {
  llm: ModelChoice
  embedding: ModelChoice
  apiKey: string
}

type ModelModalProps = {
  onClose: () => void
}

const items = [
  { label: "Ollama", value: "ollama"},
  { label: "OpenAI", value: "openai"}
]

export default function ModelModal({ onClose }: ModelModalProps) {
  const [provider, setProvider] = useState<"openai" | 'ollama'>('ollama')
  const [model, setModel] = useState('')
  const [apiKey, setApiKey] = useState('')


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <Card className="flex flex-col w-[20rem] max-w-[90vw] items-center gap-3 bg-white shadow-xl overflow-auto" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="flex justify-between items-center gap-6 w-full text-gray-400">
          <p className="text-black">Choose your model</p>
          <Button onClick={onClose} className="cursor-pointer">✕</Button>
        </CardHeader>  
        <CardContent className='flex flex-col items-center justify-center'>
          <Select items={items} value={provider} onValueChange={(value) => {
            if (value) {
              setProvider(value)
              setModel('')
            }
            }}>
            <Field>
              <FieldLabel>Provider</FieldLabel>
              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>
            </Field>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Provider</SelectLabel>
                {items.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {provider == 'openai' && (
              <Field className='mt-5'>
                <FieldLabel htmlFor='api-key'>API Key</FieldLabel>
                <Input 
                  id='api-key'
                  type='password'
                  placeholder='sk-...'
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </Field>
          )}
          <Select value={model} onValueChange={(value) => {
            if (value) {
              setModel(value)
            }
          }}>
            <Field className='mt-5'>
              <FieldLabel>Model</FieldLabel>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
            </Field>
            <SelectContent>
              <SelectGroup>
                <SelectItem value='fake-model2'>fake-model2</SelectItem>
                <SelectItem value='fake-model3'>fake-model3</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button className='mt-5 cursor-pointer' disabled={!model}>Next</Button>
        </CardContent>     
      </Card>
    </div>
  )
}