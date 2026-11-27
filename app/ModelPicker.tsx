'use client'

import { type OllamaModel } from './providers'
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
import { AlertCircleIcon } from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert"

type ModelPickerProps = {
    value: string
    onChange: (model: string) => void
    ollamaModels: OllamaModel[]
    isLoadingModels?: boolean
}

export default function ModelPicker({ value, onChange, ollamaModels, isLoadingModels = false }: ModelPickerProps) {
    const modelOptions = ollamaModels
        .filter(model => model.capabilities.includes("completion"))
        .map(model => model.name)

    const modelItems = modelOptions.map(model => <SelectItem value={model} key={model}>{model}</SelectItem>)

    return (
         <>
            {modelOptions.length > 0 && (
                <Select value={value} onValueChange={(m) => { if (m) onChange(m) }}>
                    <Field className='w-48'>
                        <FieldLabel>Model</FieldLabel>
                        <SelectTrigger className='w-full h-7 rounded-md px-2.5 text-[0.8125rem]'>
                            <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                    </Field>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Model</SelectLabel>
                            {modelItems}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            )}

            {isLoadingModels && (
                <p role="status" aria-live="polite" className='mt-5 text-sm text-gray-500'>
                    Loading models…
                </p>
            )}

            {!isLoadingModels && modelOptions.length == 0 && (
                <Alert variant='destructive' className='max-w-md mt-5'>
                    <AlertCircleIcon />
                    <AlertTitle>No models found</AlertTitle>
                    <AlertDescription>
                        Ollama did not report any chat model. Make sure it is running and
                        you have pulled at least one model, for example{' '}
                        <code>ollama pull llama3.2</code>. Then reopen this dialog.
                    </AlertDescription>
                </Alert>
            )}
         </>
    )
}
