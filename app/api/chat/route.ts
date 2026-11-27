import { convertToModelMessages, streamText, type UIMessage } from 'ai'
import { ollama } from 'ollama-ai-provider-v2'
import { findRelevantChunks } from '@/lib/retrieval'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type ChatBody = {
    messages: UIMessage[]
    docId: string
    model: string
}

export async function POST(request: Request) {
    try {
        const { messages, docId, model } = (await request.json()) as ChatBody

        if (!Array.isArray(messages) || messages.length === 0) {
            return Response.json(
                { error: 'messages must be a non-empty array' },
                { status: 400 }
            )
        }

        const userMessages = messages.filter((message) => message.role === 'user')
        const lastUserMessage = userMessages[userMessages.length - 1]

        const question = lastUserMessage?.parts
            .filter((part) => part.type === 'text')
            .map((part) => part.text)
            .join(' ')
            .trim()

        if (!question) {
            return Response.json(
                { error: 'No question found in messages' },
                { status: 400 }
            )
        }

        if (typeof docId !== "string" || !UUID.test(docId)) {
            return Response.json(
                { error: "docId must be a UUID" },
                { status: 400 }
            )
        }

        if (typeof model !== "string" || model.trim() === "") {
            return Response.json(
                { error: "model must be a non-empty string" },
                { status: 400 }
            )
        }

        const chunks = await findRelevantChunks(question, docId)

        if (chunks.length === 0) {
            return Response.json(
                { error: "No content found for this document" },
                { status: 404 }
            )
        }

        const excerpts = chunks
            .map((chunk, i) => `[${i + 1}] page ${chunk.page}\n${chunk.text}`)
            .join("\n\n")

        const result = streamText({
            model: ollama.chat(model),
            system: `You answer questions about one document.
Rules:
- Use only the excerpts provided. Do not use outside knowledge.
- If the excerpts do not contain the answer, say so plainly.
- Cite the page for every claim, like (page 3).
- Answer in the same language as the question.
- Be brief: 2-4 sentences unless the question asks for detail.

Excerpts:

${excerpts}`,
            messages: await convertToModelMessages(messages),
        })

        return result.toUIMessageStreamResponse()
    }
    catch (error) {
        console.error("Chat failed:", error)
        return Response.json(
            { error: "Chat failed" },
            { status: 500 }
        )
    }
}
