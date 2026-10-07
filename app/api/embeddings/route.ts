import { embedMany } from "ai"
import { ollama } from "ollama-ai-provider-v2"
import { createOpenAI } from "@ai-sdk/openai"

export async function POST(request: Request) {
    try {
        const body = await request.json()
        if (body.embedding.provider == "ollama") {
            const model = ollama.embeddingModel(body.embedding.model)
            const { embeddings } = await embedMany({
                model: model,
                values: body.texts
            })
    
            return Response.json({ embeddings })
        } else if (body.embedding.provider == "openai") {
            if (typeof body.apiKey !== "string" || body.apiKey.trim() === "") {
                return Response.json(
                    { error: "An OpenAI API key is required." },
                    { status: 400 }
                )
            }
            const openai = createOpenAI({
                apiKey: body.apiKey
            })
            const model = openai.embedding(body.embedding.model)
            const { embeddings } = await embedMany({
                model: model,
                values: body.texts
            })
    
            return Response.json({ embeddings })
        }
        return Response.json(
            { error: "Embedding provider not supported yet." },
            { status: 400 }
        )
    } catch (error) {
        console.error("Embedding generation failed:", error)
        return Response.json(
            { error: "Could not create embeddings." },
            { status: 500 }
        )
    }
}