"use client"

import ImageStream from '@/components/ImageStream'
import ImageSearch from '@/components/ImageSearch'
import react, { useState } from 'react'

export default function Main() {
    const [timestampMax, setTimestampMax] = useState<Date>()
    return (
        <div className="flex ">
            <div className="flex-1 p-6 border-r border-gray-800 h-screen">
                <h2 className="text-xl font-bold mb-4 text-[#FFFF76]">Image Stream</h2>
                <ImageStream setTimestampMax={setTimestampMax} />
            </div>
            <div className="flex-1 p-6 max-h-screen">
                <h2 className="text-xl font-bold mb-4 text-[#FFFF76]">Image Search</h2>
                <ImageSearch timestampMax={timestampMax} />
            </div>
        </div>
    )
}