"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Icon } from '@clickhouse/click-ui' 

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
    const [imageData, setImageData] = useState<string>();
    const [loading, setLoading] = useState(false);
    const [timeWindow, setTimeWindow] = useState<number>(10)
    const defaultImageUrl = "default-dog.jpg"
    const timerTimestamp = useRef(0)
   
    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        try {
            // Convert the image to base64
            const base64Image = await convertToBase64(file);
            // Remove the "data:image/jpeg;base64," prefix
            const base64String = base64Image.split(',')[1];
            setImageData(base64String);
            setReferenceImage(URL.createObjectURL(file));
        } catch (error) {
            console.error('Error:', error);
        } 
        
    }, [])
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })


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
            setImageData(base64String);
        };
        fetchDefaultImage();
    }, [])

    useEffect(() => {
        if (!timestampMax) return
    
        timerTimestamp.current = timerTimestamp.current + 1
        if (timerTimestamp.current == 10 || recentSimilarImages.length == 0) {
            timerTimestamp.current = 0
            fetchRecentSimilarImages();
        }
    }, [timestampMax])

    const fetchAllTimesSimilarImages = async () => {
        try {
            const response = await fetch('/api/images/search', {
                method: 'POST',
                body: JSON.stringify({ base64Data: imageData  }),
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
                body: JSON.stringify({ base64Data: imageData }),
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

    useEffect(() => {
        if (!imageData) return

        setLoading(true);
        setAllTimesSimilarImages([]);
        setRecentSimilarImages([]);
        fetchAllTimesSimilarImages();
        if (timestampMax) {
            fetchRecentSimilarImages();
        }
        setLoading(false);
    }, [imageData])

    const convertToBase64 = (file: File | Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    return (
        <div className="overflow-y-auto h-[calc(80vh-theme(spacing.16))]">
            <div className="space-y-4">
                <div className="flex gap-2">
                       Image upload<Icon name="upload" />
                </div>
                <div>
                    <div {...getRootProps({ className: 'bg-black rounded-lg p-4 h-[76px] flex items-center justify-center border border-[#696E79] border-dashed' })}>
                        <input {...getInputProps()} />
                        {
                            isDragActive ?
                                <p>Drop the file here ...</p> :
                                <p>Drag and drop file or browse</p>
                        }
                    </div>
                </div>
                <div className="w-full h-40">
                    {!referenceImage && defaultImageUrl && (
                        <img
                            src={defaultImageUrl}
                            alt="Default image"
                            className="object-scale-down w-full p-2 h-40"
                        />
                    )}

                    {referenceImage && (
                        <img
                            src={referenceImage}
                            alt="Reference image"
                            className="object-scale-down w-full p-2 h-40"
                        />
                    )}
                </div>
                <div>
                    <div className="border border-[#696E79] rounded-lg p-2 mb-4">
                        <div className="mb-2 text-sm">Most similar images (all time)</div>
                        <div className="grid grid-cols-3 h-42">
                            {allTimesSimilarImages.map((image, index) => (
                                <div
                                    key={index}
                                >
                                    <img
                                        src={'data:image/jpeg;base64, ' + image.base64_data}
                                        alt={`Similar image ${index}`}
                                        className="object-contain w-full p-2 h-40"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="border border-[#696E79] rounded-lg p-2">
                        <div className="mb-2 text-sm">Most similar images (Last 10 minutes)</div>
                        <div className="grid grid-cols-3 gap-2 h-42">
                            {recentSimilarImages.map((image, index) => (
                                <div
                                    key={index}

                                >
                                    <img
                                        src={'data:image/jpeg;base64, ' + image.base64_data}
                                        alt={`Similar image ${index}`}
                                        className="object-contain w-full p-2 h-40"
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