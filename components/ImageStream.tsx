"use client"

import { useEffect, useRef, useState } from 'react'
import InfiniteScroll from "react-infinite-scroll-component";

interface StreamedImage {
    id: string
    url: string
    timestamp: string
    base64_data: string
}

export default function ImageStream({ setTimestampMax }: { setTimestampMax: (timestamp: Date) => void }) {
    const [galleryImages, updateGalleryImages] = useState<StreamedImage[]>([]);
    const [pageIndex, updatePageIndex] = useState(1);
    const [currentTimestamp, setCurrentTimestamp] = useState<string>('2023-11-12 10:29:00')
    const lastTimestampRef = useRef(currentTimestamp)
    const timerPageIndex = useRef(0)

    useEffect(() => {
        getPhotos();
    }, [pageIndex]);

    function getPhotos() {
        try {
            fetch(`/api/images/stream?timestamp=${lastTimestampRef.current}`).then((res) => res.json())
                .then((newImages) => {
                    if (pageIndex === 1) updateGalleryImages([]);
                    const temp = [...galleryImages, ...newImages]
                    updateGalleryImages(temp);
                    if (newImages.length > 0) {
                        const newTimestamp = newImages[newImages.length - 1].timestamp
                        lastTimestampRef.current = newTimestamp
                        setTimestampMax(new Date(newTimestamp))
                        setCurrentTimestamp(newTimestamp)
                    }
                });

        } catch (error) {
            console.error('Failed to fetch images:', error)
        }
    }



    // Add auto-increment effect
    useEffect(() => {
        const timer = setInterval(() => {
            updatePageIndex(prevIndex => prevIndex + 1);
        }, 1000); // 1000ms = 1 second
        // Cleanup function to clear interval when component unmounts
        return () => clearInterval(timer);
    }, []); // Empty dependency array means this runs once on mount


    return (
        <div className="relative h-full overflow-hidden">
            <InfiniteScroll
                dataLength={galleryImages.length}
                next={() => updatePageIndex((pageIndex) => pageIndex + 1)}
                hasMore={true}
                loader={''}
                className="h-full "
            >
                <div className="grid grid-cols-4 gap-4 absolute w-full bottom-0">
                    {galleryImages.map((image, index) => (
                        <a
                            className="image"
                            key={index}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <img src={'data:image/jpeg;base64, ' + image.base64_data} data-id={image.id} className="object-cover p-2" />
                        </a>
                    ))}
                </div>
            </InfiniteScroll>
        </div>
    );
}