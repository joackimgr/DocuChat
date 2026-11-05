import { embedMany } from "ai"
import { ollama } from "ollama-ai-provider-v2"
import { db } from "@/lib/db"
import { chunksTable } from "@/lib/db/schema"

type IngestBody = {
    docId: string
    docName: string
    chunks: { page: number; text: string }[]
}

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as IngestBody
        const model = ollama.embeddingModel('bge-m3')

        if (typeof body.docId !== "string" || body.docId === "") {
            return Response.json(
                { error: 'Document id must be a string'},
                { status: 400 }
            )
        }

        if (typeof body.docName !== "string" || body.docName === "") {
            return Response.json(
                { error: 'Documents name must be a string'},
                { status: 400 }
            )
        }

        if (!Array.isArray(body.chunks)) {
            return Response.json(
                { error: 'Chunks must be an array' },
                { status: 400 }
            )
        }

        if (body.chunks.length === 0) {
            return Response.json(
                { error: 'Chunks is empty'},
                { status: 400 }
            )
        }

        const badIndex = body.chunks.findIndex(
            (chunk) => 
                typeof chunk?.page !== "number" || 
                typeof chunk?.text !== "string" || 
                chunk.text.trim() === ""
        )

        if (badIndex !== -1) {
            return Response.json(
                { error: `chunks[${badIndex}] is not a non-empty string` },
                { status: 400 }
            )
        }

        if (body.chunks.length > 100) {
            return Response.json(
                { error: `Max 100 chunks per request, got ${body.chunks.length}`},
                { status: 400 }
            )
        }

        const { embeddings } = await embedMany({
            model: model,
            values: body.chunks.map((chunk) => chunk.text)
        })

        if (embeddings[0].length !== 1024) {
            return Response.json(
                { error: `Embedding model returned ${embeddings[0].length} dimensions, expected 1024.` },
                { status: 500 }
            )
        }

        await db.insert(chunksTable).values(
            body.chunks.map((chunk, i) => ({
                doc_id: body.docId,
                doc_name: body.docName,
                page: chunk.page,
                text: chunk.text, 
                embedding: embeddings[i]
            }))
        )

        return Response.json({ inserted: body.chunks.length })
    } catch (error) {
        console.error("Embedding generation failed:", error)
        return Response.json(
            { error: "Could not create embeddings." },
            { status: 500 }
        )
    }
}