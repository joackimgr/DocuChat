import { count, eq, max, ne } from 'drizzle-orm'
import { db } from '@/lib/db'
import { chunksTable } from '@/lib/db/schema'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type DeleteBody = {
    docId?: string
    keepDocId?: string
}

export async function GET() {
    try {
        const documents = await db
            .select({
                docId: chunksTable.doc_id,
                docName: chunksTable.doc_name,
                passages: count(),
                lastPage: max(chunksTable.page),
            })
            .from(chunksTable)
            .groupBy(chunksTable.doc_id, chunksTable.doc_name)

        return Response.json({ documents })
    } catch (error) {
        console.error('Could not list documents:', error)
        return Response.json({ error: 'Could not list documents' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const { docId, keepDocId } = (await request.json()) as DeleteBody

        if (typeof docId === 'string' && UUID.test(docId)) {
            await db.delete(chunksTable).where(eq(chunksTable.doc_id, docId))
            return Response.json({ deleted: docId })
        }

        if (typeof keepDocId === 'string' && UUID.test(keepDocId)) {
            await db.delete(chunksTable).where(ne(chunksTable.doc_id, keepDocId))
            return Response.json({ kept: keepDocId })
        }

        return Response.json(
            { error: 'Provide docId, or keepDocId, as a UUID' },
            { status: 400 }
        )
    } catch (error) {
        console.error('Document cleanup failed:', error)
        return Response.json({ error: 'Cleanup failed' }, { status: 500 })
    }
}
