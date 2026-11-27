import { createTextStreamResponse, streamText, toTextStream } from 'ai'
import { ollama } from 'ollama-ai-provider-v2'
import { findRelevantChunks } from '@/lib/retrieval'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(request: Request) {
    try {
        const { question, docId, llm } = await request.json()

        if (typeof question !== "string" || question.trim() === "") {
            return Response.json(
                { error: 'Question must be a non-empty string' },
                { status: 400 }
            )
        }

        if (typeof docId !== "string" || !UUID.test(docId)) {
            return Response.json(
                { error: "docId must be a UUID" },
                { status: 400 }
            )
        }

        if (!llm || typeof llm.model !== "string" || llm.model.trim() === "") {
            return Response.json(
                { error: "llm.model must be a non-empty string" },
                { status: 400 }
            )
        }

        if (llm.provider !== "ollama") {
            return Response.json(
                { error: "Only the ollama provider is supported" },
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
            model: ollama.chat(llm.model),
            system: `You answer questions about one document.
                Rules:
                - Use only the excerpts provided. Do not use outside knowledge.
                - If the excerpts do not contain the answer, say so plainly.
                - Cite the page for every claim, like (page 3).
                - Answer in the same language as the question.
                - Be brief: 2-4 sentences unless the question asks for detail.`,
            prompt: `Excerpts:

            ${excerpts}

            Question: ${question}`,
        })

        return createTextStreamResponse({
            stream: toTextStream({ stream: result.stream }),
        })
    }
    catch (error) {
        console.error("Chat failed:", error)
        return Response.json(
            { error: "Chat failed" },
            { status: 500 }
        )
    }
}
