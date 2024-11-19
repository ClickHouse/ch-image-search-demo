'use client'

import { useState, useEffect, useRef } from 'react'

interface SimilarImage {
    id: string
    url: string
    timestamp: string
    base64_data: string
}


export default function ImageSearch({ timestampMax }: { timestampMax: Date | undefined}) {
    const [referenceImage, setReferenceImage] = useState<string | null>(null)
    const [allTimesSimilarImages, setAllTimesSimilarImages] = useState<SimilarImage[]>([]);
    const [recentSimilarImages, setRecentSimilarImages] = useState<SimilarImage[]>([]);
    const [embedding, setEmbedding] = useState(null);
    const [loading, setLoading] = useState(false);
    const [timeWindow, setTimeWindow] = useState<number>(10)
    const defaultImageUrl = "default-dog.jpg"
    const timerTimestamp = useRef(0)
   

    const getTimestampMin = () => {
        if (!timestampMax) return
        const timestampMin = new Date(timestampMax)
        timestampMin.setMinutes(timestampMin.getMinutes() - timeWindow)
        return timestampMin.toISOString()
    }

    useEffect(() => {
        const fetchDefaultImage = async () => {
            if (!defaultImageUrl) return
            const response = await fetch(defaultImageUrl);
            const blob = await response.blob();
            const base64 = await convertToBase64(blob);
            const base64String = base64.split(',')[1];
            const resultEmbedding = await generateEmbedding(base64String);
            setEmbedding(resultEmbedding);
        };
        fetchDefaultImage();
    }, [])

    useEffect(() => {
        if (!timestampMax) return
    
        timerTimestamp.current = timerTimestamp.current + 1
        console.log("timerTimestamp.current: ", timerTimestamp.current)
        if (timerTimestamp.current == 10) {
            console.log("timestampMax: ", timestampMax)
            timerTimestamp.current = 0
            fetchRecentSimilarImages();
        }
    }, [timestampMax])

    const fetchAllTimesSimilarImages = async () => {
        try {
            const response = await fetch('/api/images/search', {
                method: 'POST',
                body: JSON.stringify({ vectorData: embedding }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            } 
            const data = await response.json();
            setAllTimesSimilarImages(data);
        } catch (error) {
            console.warn('Failed to fetch similar images:', error);
            setAllTimesSimilarImages([]); // Reset to empty array on error
            // You could also add state for error handling if you want to show error messages in the UI
        }
    };

    const fetchRecentSimilarImages = async () => {
        try {
            const response = await fetch(`/api/images/search?timestamp_min=${getTimestampMin()}&timestamp_max=${timestampMax?.toISOString()}`, {
                method: 'POST',
                body: JSON.stringify({ vectorData: embedding }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setRecentSimilarImages(data);
        } catch (error) {
            console.warn('Failed to fetch similar images:', error);
            setRecentSimilarImages([]); // Reset to empty array on error
            // You could also add state for error handling if you want to show error messages in the UI
        }
    }

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

    useEffect(() => {
        if (!embedding) return

        fetchAllTimesSimilarImages();
        fetchRecentSimilarImages();
    }, [embedding])

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setLoading(true);

        try {
            // Convert the image to base64
            const base64Image = await convertToBase64(file);

            // Remove the "data:image/jpeg;base64," prefix
            const base64String = base64Image.split(',')[1];
            const resultEmbedding = await generateEmbedding(base64String)
            setEmbedding(resultEmbedding);
            setReferenceImage(URL.createObjectURL(file));


        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }

    const convertToBase64 = (file: File | Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    return (
        <div className="relative h-full overflow-y-auto">
            <div className="space-y-4">
                <div>
                    <label
                        htmlFor="imageUpload"
                        className="bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors"
                    >
                        Upload Image
                    </label>
                    <input
                        id="imageUpload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                    />
                </div>
                <div>
                    {!referenceImage && defaultImageUrl && (
                        <img
                            src={defaultImageUrl}
                            alt="Default image"
                            className="object-cover p-2 h-[150px]"
                        />
                    )}

                    {referenceImage && (
                        <img
                            src={referenceImage}
                            alt="Reference image"
                            className="object-cover p-2 h-[150px]"
                        />
                    )}
                </div>
                <div className="grid grid-cols-2 gap-4 h-screen">
                    <div className="overflow-y-auto">
                        <label className="block mb-2">Most similar images - All times</label>
                        <div className="grid grid-cols-2 gap-2 border border-white rounded-lg p-2">
                            {allTimesSimilarImages.map((image, index) => (
                                <div
                                    key={index}
                                    className="relative aspect-square bg-[#141414]"
                                >
                                    <img
                                        src={'data:image/jpeg;base64, ' + image.base64_data}
                                        alt={`Similar image ${index}`}
                                        className="absolute inset-0 w-full h-full object-cover rounded-lg p-1"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="overflow-y-auto">
                        <label className="block mb-2">Most similar images - Last 10 minutes</label>
                        <div className="grid grid-cols-2 gap-2 border border-white rounded-lg p-2">
                            {recentSimilarImages.map((image, index) => (
                                <div
                                    key={index}
                                    className="relative aspect-square bg-[#141414]"
                                >
                                    <img
                                        src={'data:image/jpeg;base64, ' + image.base64_data}
                                        alt={`Similar image ${index}`}
                                        className="absolute inset-0 w-full h-full object-cover rounded-lg p-1"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 