'use client'

import { PROVIDERS, type ProviderId, type Role } from './providers'
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
import { AlertCircleIcon } from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert"


type ModelChoice =  { 
    provider: ProviderId
    model: string
}

type ModelPickerProps = {
    role: Role
    value: ModelChoice
    onChange: (choice: ModelChoice) => void
    apiKey: string
    onApiKeyChange: (key: string) => void
    ollamaModels: string[]
}

export default function ModelPicker({ role, value, onChange, apiKey, onApiKeyChange, ollamaModels }: ModelPickerProps) {
    const providerOptions = (Object.keys(PROVIDERS) as ProviderId[])
    .filter(id => PROVIDERS[id].supports.includes(role))
    .map(id => ({ value: id, label: PROVIDERS[id].label }))

    const modelOptions = value.provider === "ollama"
        ? ollamaModels
        : PROVIDERS[value.provider].models[role]

    const modelItems = modelOptions.map(model => <SelectItem value={model} key={model}>{model}</SelectItem>)

    return (
         <>
            <Select value={value.provider} onValueChange={(p) => {
            if (p) {
              onChange({ ...value, provider: p, model: ''})
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
                    {providerOptions.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                        {item.label}
                    </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
            </Select>
            {value.provider == 'openai' && (
                <Field className='mt-5'>
                    <FieldLabel htmlFor='api-key'>API Key</FieldLabel>
                    <Input 
                    id='api-key'
                    type='password'
                    placeholder='sk-...'
                    value={apiKey}
                    onChange={(e) => onApiKeyChange(e.target.value)}
                    />
                </Field>
            )}
            {modelOptions.length > 0 && (
            <Select 
                value={value.model}
                onValueChange={(m) => {
                    if (m) {
                        onChange({ ...value, model: m})
                }
            }}>
                <Field className='mt-5'>
                <FieldLabel>Model</FieldLabel>
                <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                </SelectTrigger>
                </Field>
                <SelectContent>
                <SelectGroup>
                    {modelItems}
                </SelectGroup>
                </SelectContent>
            </Select>
            )}
            {modelOptions.length == 0 && (
                <Alert variant='destructive' className='max-w-md mt-5'>
                <AlertCircleIcon />
                <AlertTitle>Models not found</AlertTitle>
                <AlertDescription>
                    We couldn&apos;t find any models from {PROVIDERS[value.provider].label}. Make sure Ollama is running and you&apos;ve pulled at least one model (e.g. ollama pull llama3.2), then try again.
                </AlertDescription>
                </Alert>
            )}
         </>
    )
}