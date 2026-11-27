'use client'

import { useEffect, useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { type ModelConfig } from './ModelModal'

type ChatPanelProps = {
    docId: string
    modelConfig: ModelConfig
}

function textOf(message: { parts: Array<{ type: string; text?: string }> }) {
    return message.parts
        .filter((part) => part.type === 'text')
        .map((part) => part.text ?? '')
        .join('')
}

export default function ChatPanel({ docId, modelConfig }: ChatPanelProps) {
    const [input, setInput] = useState('')
    const [model, setModel] = useState(modelConfig.llm.model)
    const [models, setModels] = useState<string[]>([])
    const bottomRef = useRef<HTMLDivElement | null>(null)

    const { messages, sendMessage, status, stop, error } = useChat({
        transport: new DefaultChatTransport({ api: '/api/chat' }),
    })

    useEffect(() => {
        async function loadModels() {
            try {
                const res = await fetch('/api/ollama/models')
                if (!res.ok) return
                const data = await res.json()
                const names = (data.models as Array<{ name: string; capabilities: string[] }>)
                    .filter((entry) => entry.capabilities.includes('completion'))
                    .map((entry) => entry.name)
                setModels(names)
                setModel((current) => current || names[0] || '')
            } catch (error) {
                console.error('Could not load models', error)
            }
        }
        loadModels()
    }, [])

    const isBusy = status === 'submitted' || status === 'streaming'
    const isWaiting = status === 'submitted'

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isWaiting])

    function handleSubmit(event: React.FormEvent) {
        event.preventDefault()
        if (!input.trim() || isBusy || !model) return
        sendMessage({ text: input }, { body: { docId, model } })
        setInput('')
    }

    return (
        <div className="flex flex-col flex-1 min-h-0 gap-4">
            <div className="flex-1 overflow-y-auto flex flex-col gap-4">
                {messages.length === 0 && (
                    <p className="text-gray-500 text-sm">
                        Ask a question about this PDF. Answers cite the page they come from.
                    </p>
                )}

                {messages.map((message) => (
                    message.role === 'user' ? (
                        <div key={message.id} className="flex justify-end self-end max-w-[80%]">
                            <div className="whitespace-pre-wrap break-words min-w-0 rounded-lg bg-green-100 px-4 py-3">
                                {message.parts.map((part, index) =>
                                    part.type === 'text'
                                        ? <span key={index}>{part.text}</span>
                                        : null
                                )}
                            </div>
                        </div>
                    ) : (
                        <div key={message.id} className="flex flex-col gap-1 self-start max-w-[70%]">
                            <span className="text-xs text-gray-500">DocuChat</span>
                            <div className="break-words min-w-0 rounded-lg border border-gray-200 bg-white px-4 py-3 text-[0.95rem] leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_strong]:font-semibold [&_h1]:mb-2 [&_h1]:text-base [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:font-semibold [&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.85em] [&_a]:text-blue-700 [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-gray-300 [&_blockquote]:pl-3 [&_blockquote]:text-gray-600">
                                <Markdown remarkPlugins={[remarkGfm]}>
                                    {textOf(message)}
                                </Markdown>
                            </div>
                        </div>
                    )
                ))}

                {isWaiting && (
                    <div className="flex flex-col gap-1 self-start w-fit" role="status" aria-live="polite">
                        <span className="text-xs text-gray-500">DocuChat</span>
                        <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-3">
                            <span className="size-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s] motion-reduce:animate-none" />
                            <span className="size-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s] motion-reduce:animate-none" />
                            <span className="size-1.5 animate-bounce rounded-full bg-gray-400 motion-reduce:animate-none" />
                            <span className="ml-2 text-sm text-gray-500">Reading the document…</span>
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {error && <p role="alert" className="text-sm text-red-500">{error.message}</p>}

            <div className="flex items-center justify-between gap-3 border-t pt-3 text-sm text-gray-600">
                <span>
                    Answering with <span className="font-semibold text-gray-900">{model}</span>
                </span>
                <label className="flex items-center gap-2">
                    <span className="sr-only">Change the model</span>
                    <select
                        value={model}
                        onChange={(event) => setModel(event.target.value)}
                        disabled={models.length === 0}
                        className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-800 focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:outline-none"
                    >
                        {models.length === 0 && <option value={model}>{model}</option>}
                        {models.map((name) => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                </label>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2 pt-2">
                <label htmlFor="chat-question" className="sr-only">Your question</label>
                <Input
                    id="chat-question"
                    name="question"
                    autoComplete="off"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Ask about this PDF…"
                />
                {isBusy ? (
                    <Button type="button" onClick={stop}>
                        Stop
                    </Button>
                ) : (
                    <Button type="submit" disabled={!input.trim() || !model}>
                        Send
                    </Button>
                )}
            </form>
        </div>
    )
}
