import { NextResponse } from "next/server"

export async function GET() {
    try {
        const response = await fetch('http://localhost:11434/api/tags')

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`)
        }

        const data = await response.json()
        const modelsWithCapabilities = await Promise.all(
            data.models.map(async (model: { name: string }) => {
                const detailsResponse = await fetch('http://localhost:11434/api/show', {
                method: 'POST',
                headers: {
                    "content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: model.name
                })
            })
            const details = await detailsResponse.json()
            return {
                name: model.name,
                capabilities: details.capabilities
            }
            })
        )
        return NextResponse.json({ models: modelsWithCapabilities })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Could not reach Ollama"}, { status: 502 })
    }
}