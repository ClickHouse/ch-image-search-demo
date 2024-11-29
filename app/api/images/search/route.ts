import { NextResponse } from 'next/server'
import clickhouse from '@/utils/clickhouse'

export async function POST(request: Request) {

    

    try {
        const { vectorData } = await request.json()
        const { searchParams } = new URL(request.url)
        const timestampMin = searchParams.get('timestamp_min')
        const timestampMax = searchParams.get('timestamp_max')
        if (vectorData.length === 0) {
            return NextResponse.json({ error: 'No vector data provided' }, { status: 400 })
        }
        // Convert the vector data to a string format that ClickHouse can understand
        const vectorString = `[${vectorData.join(',')}]`
        if (timestampMin != null && timestampMax != null) {
            const result = await clickhouse.query({
                query: `
            SELECT id, base64_data, L2Distance(image_embedding, ${vectorString}) as score
            FROM social_posts_with_images WHERE similarity >= 0.2 and timestamp > parseDateTimeBestEffort({timestampMin:String}) and timestamp < parseDateTimeBestEffort({timestampMax:String})
            ORDER BY score ASC
            LIMIT 3
            SETTINGS enable_analyzer = 1
        `,
                format: 'JSONEachRow',
                query_params: {
                    timestampMin: timestampMin,
                    timestampMax: timestampMax
                }
            })
            const data = await result.json()
            return NextResponse.json(data)
        } else {
            const result = await clickhouse.query({
                query: `
                SELECT id, base64_data, L2Distance(image_embedding, ${vectorString}) as score
                FROM social_posts_with_images WHERE similarity >= 0.1
                ORDER BY score ASC
                LIMIT 3
                SETTINGS enable_analyzer = 0
                SETTINGS use_query_cache = true
                SETTINGS query_cache_ttl = 28800
            `,
                format: 'JSONEachRow',
            })
            const data = await result.json()
            return NextResponse.json(data)
        }
    } catch (error) {
        console.error('Search error:', error)
        return NextResponse.json({ error: 'Failed to search images' }, { status: 500 })
    }
} 
