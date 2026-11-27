import { embed } from 'ai'
import { ollama } from 'ollama-ai-provider-v2'
import { cosineDistance, eq, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { chunksTable } from '@/lib/db/schema'

export async function findRelevantChunks(question: string, docId: string, limit = 5) {
    const { embedding } = await embed({
        model: ollama.embeddingModel('bge-m3'),
        value: question,
    })

    const distance = cosineDistance(chunksTable.embedding, embedding)

    return db
        .select({
            text: chunksTable.text,
            page: chunksTable.page,
            similarity: sql<number>`1 - (${distance})`,
        })
        .from(chunksTable)
        .where(eq(chunksTable.doc_id, docId))
        .orderBy(distance)
        .limit(limit)
}
