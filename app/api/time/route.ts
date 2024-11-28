import { NextResponse } from 'next/server'
import clickhouse from '@/utils/clickhouse'

export async function GET() {
    try {
        const result = await clickhouse.query({
            query: `
            SELECT timestamp
                FROM social_posts_with_images
                WHERE timestamp >= (
                    SELECT min(timestamp)
                    FROM social_posts_with_images
                )
                AND timestamp <= (
                    SELECT max(timestamp) - INTERVAL 2 DAY
                    FROM social_posts_with_images
                )
                ORDER BY rand()
                LIMIT 1;`,
            format: 'JSONEachRow'
        })
        const data = await result.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Search error:', error)
        return NextResponse.json({ error: 'Failed to retrieve random timestamp' }, { status: 500 })
    }
} 

