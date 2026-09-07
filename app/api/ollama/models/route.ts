import { NextResponse } from "next/server"

export async function GET() {
    try {
        const response = await fetch('http://localhost:11434/api/tags')

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`)
        }

        const data = await response.json()
        const models = data.models.map((m: { name: string }) => m.name)

        return NextResponse.json({ models })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Could not reach Ollama"}, { status: 502 })
    }
}