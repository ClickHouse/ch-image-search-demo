"use client"

import ImageStream from './ImageStream'
import ImageSearch from './ImageSearch'
import { useState } from 'react'
import { ClickUIProvider, ThemeName } from '@clickhouse/click-ui'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function Main() {

    const [timestampMax, setTimestampMax] = useState<Date>()
    const [theme] = useState<ThemeName>('dark')

    return (
        <ClickUIProvider theme={theme}>
            <div className="flex isolate">
                <div className="flex-1 p-6 m-3 max-h-screen bg-[#262527]">
                    <h2 className="text-xl mb-14 pb-2 border-b border-white">Image Search</h2>
                    <ImageSearch timestampMax={timestampMax} />
                </div>
                <div className="flex-1 p-6 m-3 max-h-screen bg-[#262527]">
                    <h2 className="text-xl mb-14 pb-2 border-b border-white">Image Stream</h2>
                    <ImageStream setTimestampMax={setTimestampMax} />
                </div>
            </div>
        </ClickUIProvider>
    )
}
