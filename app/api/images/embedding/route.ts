import { NextResponse } from 'next/server'


const generateEmbedding = async (base64String: string) => {
    const responseEmbedding = await fetch('http://localhost:8000/get-embedding', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ base64_image: base64String }),
    })
    const dataEmbedding = await responseEmbedding.json();
    return dataEmbedding.embedding
}

export async function POST(request: Request) {
    try {
        const { base64Data } = await request.json()
        const vectorData = await generateEmbedding(base64Data)
        return NextResponse.json(vectorData)
    } catch (error) {
        console.error('Error generating embedding:', error)
        return NextResponse.json({ error: 'Failed to generate embedding' }, { status: 500 })
    }
}
