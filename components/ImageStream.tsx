import React, { useState, useEffect, useCallback, useRef } from "react";
import { InfiniteLoader, List } from "react-virtualized";
import { DEFAULT_SCROLL_SPEED } from "./Main";

interface StreamedImage {

    id: number
    url: string
    timestamp: string
    base64_data: string
}



const ROW_HEIGHT = 400;
const IMAGES_PER_ROW = 4;

// Create a wrapper component for the row animation
const AnimatedRow = ({ children, style }: {
    children: React.ReactNode;
    style: React.CSSProperties;
}) => {

    return (
        <div
            style={{
                ...style,
            }}
        >
            {children}
        </div>
    );
};

export default function ImageStream({ 
    setTimestampMax, 
    scrollSpeed: DEFAULT_SCROLL_SPEED
}: { 
    setTimestampMax: (timestamp: Date) => void;
    scrollSpeed?: number;
}) {
    const [images, setImages] = useState<StreamedImage[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const [currentTimestamp, setCurrentTimestamp] = useState<string>()
    const didInit = useRef(false)
    const IMAGE_WIDTH = 800;
    const [scrollTop, setScrollTop] = useState(0);
    const animationFrameRef = useRef<number>();
    const [isLoading, setIsLoading] = useState(false)



    const fetchImages = async () => {
        try {
            setIsLoading(true)
            let timestamp = currentTimestamp
            if (!timestamp) {
                const response = await fetch(`/api/time`);
                const data = await response.json();   
                timestamp = data[0].timestamp 
            }
            const response = await fetch(`/api/images/stream?timestamp=${timestamp}`);
            const data = await response.json();
            const newTimestamp = data[data.length - 1].timestamp
            setTimestampMax(new Date(newTimestamp))
            setCurrentTimestamp(newTimestamp)
            setImages((prev) => [...prev, ...data]);
            setIsLoading(false)

        } catch (error) {
            console.error("Error fetching images:", error);
        }
    }

    const isRowLoaded = ({ index }: { index: number }) => {
        
        const startIdx = index * IMAGES_PER_ROW;

        return !!images[startIdx];
    };

    const loadMoreRows = () => {
        if (hasMore) {
            return fetchImages();
        }
        return Promise.resolve(); // If no more rows, return resolved promise
    };

    // Render each row
    const renderRow = ({ index, key, style }: { index: number; key: string; style: React.CSSProperties }) => {

        const startIdx = index * IMAGES_PER_ROW;
        const isVisible = index >= currentIndex && index < currentIndex + 4; // Show current and next row

        return (
            <AnimatedRow key={key} style={style}>
                <div className="flex justify-between items-center w-full gap-2">
                    {Array.from({ length: IMAGES_PER_ROW }).map((_, i) => {
                        const image = images[startIdx + i];
                        return (
                            <div key={i} className="w-1/4 h-[280px] p-1">
                                {image ? (
                                    <img
                                        src={'data:image/jpeg;base64, ' + image.base64_data}
                                        data-id={image.id}
                                        className="w-full h-full object-cover rounded-lg"
                                        loading="eager"
                                        alt=""
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                                        <div className="text-lg text-gray-500">Loading...</div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </AnimatedRow>
        );
    };

    // Add a new ref for the List component
    const listRef = useRef<List | null>(null);

    // Modify the auto-scroll logic to use smooth scrolling
    const startAutoScroll = useCallback(() => {
        let lastTime = performance.now();
        
        const animate = (currentTime: number) => {
            const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
            lastTime = currentTime;
            
            setScrollTop(prev => {
                const newScrollTop = prev + (scrollSpeed * deltaTime);
                return newScrollTop;
            });
            
            animationFrameRef.current = requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
    }, [scrollSpeed]);


    const stopAutoScroll = () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
    };

    useEffect(() => {
        const initializeStream = async () => {
            if (!didInit.current) {
                await fetchImages();
                startAutoScroll();
                didInit.current = true;
            }
        };
        initializeStream();
        return stopAutoScroll; // Cleanup on unmount
    }, []);


    return (
        <div
            className="relative w-[800px] h-full overflow-hidden mx-auto"
        >
            <InfiniteLoader
                isRowLoaded={isRowLoaded}
                loadMoreRows={loadMoreRows}
                rowCount={10000000000000}
                threshold={40}
            >
                {({ onRowsRendered, registerChild }: { onRowsRendered: (info: { startIndex: number; stopIndex: number }) => void; registerChild: (registeredChild: any) => void }) => (
                    <List
                        ref={(ref: any) => {
                            registerChild(ref);
                            listRef.current = ref;
                        }}
                        height={800}
                        rowHeight={ROW_HEIGHT}
                        rowCount={Math.ceil(images.length / IMAGES_PER_ROW)}
                        rowRenderer={renderRow}
                        width={IMAGE_WIDTH}
                        onRowsRendered={onRowsRendered}
                        overscanRowCount={3}
                        scrollTop={scrollTop}
                    />
                )}
            </InfiniteLoader>
        </div>
    );
}
