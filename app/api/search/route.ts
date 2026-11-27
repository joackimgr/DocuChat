import { embed } from 'ai'
import { ollama } from 'ollama-ai-provider-v2'
import { cosineDistance, eq, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { chunksTable } from '@/lib/db/schema'


export async function POST(request: Request) {
    try {
        const { question, docId } = await request.json()
        const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

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

        const { embedding } = await embed({ model: ollama.embeddingModel('bge-m3'), value: question })
        const distance = cosineDistance(chunksTable.embedding, embedding)

        const results = await db
            .select({
                text: chunksTable.text,
                page: chunksTable.page,
                similarity: sql<number>`1 - (${distance})`,
            })
            .from(chunksTable)
            .where(eq(chunksTable.doc_id, docId))
            .orderBy(distance)
            .limit(5)
        
        return Response.json({ results })
    }
    catch(error) {
        console.error("Search failed:", error)
        return Response.json(
            { error: "Search failed" },
            { status: 500 }
        )
    }
}