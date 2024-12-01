import { NextResponse } from 'next/server'
import clickhouse from '@/utils/clickhouse'

interface ImageRow {
    url: string;
    timestamp: string;
    id: string;
    base64_data: string;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const defaultTimestamp = new Date('2024-11-15').toISOString().replace('T', ' ').split('.')[0]
    const timestamp = searchParams.get('timestamp') || defaultTimestamp
    try {
        const result = await clickhouse.query({
            query: `
                SELECT url, timestamp, id, base64_data
                FROM social_posts_with_images
                WHERE timestamp > {timestamp:String} and height > 100 and width > 200
                ORDER BY timestamp ASC
                LIMIT 50
            `,
            format: 'JSONEachRow',
            query_params: {
                timestamp: timestamp
            }
        })

        const data = await result.json()
        const response: ImageRow[] = []
        for (const row of data as ImageRow[] ) {
            response.push({ ...row })
        }
        return NextResponse.json(response)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 })
    }
} 
