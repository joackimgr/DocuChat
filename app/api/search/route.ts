import { findRelevantChunks } from '@/lib/retrieval'

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

        const results = await findRelevantChunks(question, docId)

        return Response.json({ results })
    }
    catch (error) {
        console.error("Search failed:", error)
        return Response.json(
            { error: "Search failed" },
            { status: 500 }
        )
    }
}
