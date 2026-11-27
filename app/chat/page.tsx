import Link from 'next/link'
import { FileText } from 'lucide-react'
import ChatPanel from '../ChatPanel'
import NewPdfLink from '../NewPdfLink'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type ChatPageProps = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
    const params = await searchParams

    const docId = typeof params.docId === 'string' ? params.docId : ''
    const name = typeof params.name === 'string' ? params.name : 'document'
    const model = typeof params.model === 'string' ? params.model : ''

    if (!UUID.test(docId)) {
        return (
            <main className="flex min-h-screen items-center justify-center p-6">
                <p className="text-gray-600">
                    No document selected.{' '}
                    <Link href="/" className="underline">
                        Upload a PDF
                    </Link>
                </p>
            </main>
        )
    }

    return (
        <main className="mx-auto flex h-dvh w-full max-w-5xl flex-col gap-4 p-4">
            <header className="flex items-center justify-between border-b pb-3">
                <div className="flex min-w-0 items-center gap-3">
                    <FileText className="size-5 shrink-0 text-gray-500" aria-hidden="true" />
                    <div className="min-w-0">
                        <p className="text-xs text-gray-500">Chatting with</p>
                        <h1 className="truncate font-semibold">{name}</h1>
                    </div>
                </div>
                <NewPdfLink docId={docId} />
            </header>

            <ChatPanel
                docId={docId}
                modelConfig={{ llm: { model } }}
            />
        </main>
    )
}
