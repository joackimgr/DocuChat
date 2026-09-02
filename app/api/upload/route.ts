import { NextResponse } from "next/server";


export async function POST(request: Request) {
    const formData = await request.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) return NextResponse.json({ error: "No file"}, { status: 400 })
    if (file.type !== 'application/pdf') return NextResponse.json({ error: "Not a PDF"}, { status: 415 })
    if (file.size > 10*1024*1024) return NextResponse.json({ error: "File too large" }, { status: 413 })
    return NextResponse.json({ got: file.name })
}