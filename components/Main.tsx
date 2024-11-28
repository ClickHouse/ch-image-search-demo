"use client"

import ImageStream from './ImageStream'
import ImageSearch from './ImageSearch'
import { useState } from 'react'
import { ClickUIProvider, ThemeName } from '@clickhouse/click-ui'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Icon } from '@clickhouse/click-ui'

export default function Main() {

    const [timestampMax, setTimestampMax] = useState<Date>()
    const [theme] = useState<ThemeName>('dark')

    return (
        <ClickUIProvider theme={theme}>
            <div>
                <header className="flex justify-between items-center p-4 border-b border-gray-800">
                    <h1 className="text-2xl text-white">Real time vector search</h1>
                    <a target="_blank" href="https://docs.google.com/presentation/d/1X2Cam576EGKCx6ZsXVo2M1QYHigSzE5RuOJmlpaloTk/edit?usp=sharing" className="flex  gap-2 text-sm text-white-400"><Icon name="question" />How does it work?</a>
                </header>
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
            </div>
        </ClickUIProvider>
    )
}
