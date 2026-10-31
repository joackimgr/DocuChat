import { embedMany } from "ai"
import { ollama } from "ollama-ai-provider-v2"

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const model = ollama.embeddingModel('bge-m3')

        if (!Array.isArray(body.texts)) {
            return Response.json(
                { error: 'texts must be an array' },
                { status: 400 }
            )
        }

        if (body.texts.length === 0) {
            return Response.json(
                { error: 'Texts is empty'},
                { status: 400 }
            )
        }

        const badIndex = body.texts.findIndex(
            (text: unknown) => typeof text !== "string" || text.trim() === ""
        )

        if (badIndex !== -1) {
            return Response.json(
                { error: `texts[${badIndex}] is not a non-empty string` },
                { status: 400 }
            )
        }

        if (body.texts.length > 100) {
            return Response.json(
                { error: `Max 100 texts per request, got ${body.texts.length}`},
                { status: 400 }
            )
        }

        const { embeddings } = await embedMany({
            model: model,
            values: body.texts
        })

        if (embeddings[0].length !== 1024) {
            return Response.json(
                { error: `Embedding model returned ${embeddings[0].length} dimensions, expected 1024.` },
                { status: 500 }
            )
        }

        return Response.json({ embeddings })
    } catch (error) {
        console.error("Embedding generation failed:", error)
        return Response.json(
            { error: "Could not create embeddings." },
            { status: 500 }
        )
    }
}