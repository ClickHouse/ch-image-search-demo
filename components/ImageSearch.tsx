"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Icon } from '@clickhouse/click-ui' 
import { referenceImages } from '../utils/images'
import GridLoader from 'react-spinners/GridLoader'
import { ProgressBar } from '@clickhouse/click-ui'


interface SimilarImage {
    id: string
    url: string
    timestamp: string
    base64_data: string
    score: number
}


export default function ImageSearch({ timestampMax }: { timestampMax: Date | undefined}) {
    const [userReferenceImage, setUserReferenceImage] = useState<string | null>(null)
    const [allTimesSimilarImages, setAllTimesSimilarImages] = useState<SimilarImage[]>([]);
    const [recentSimilarImages, setRecentSimilarImages] = useState<SimilarImage[]>([]);
    const [imageData, setImageData] = useState<string>();
    const [vectorData, setVectorData] = useState<number[]>([]);
    const [loadingRecent, setLoadingRecent] = useState(false);
    const [loadingAllTimes, setLoadingAllTimes] = useState(false);
    const [timeWindow, setTimeWindow] = useState<number>(10)
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    
    // const defaultImageUrl = referenceImages[currentImageIndex];
   
    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        try {
            // Convert the image to base64
            const base64Image = await convertToBase64(file);
            // Remove the "data:image/jpeg;base64," prefix
            const base64String = base64Image.split(',')[1];
            setImageData(base64String);
            setUserReferenceImage(URL.createObjectURL(file));
        } catch (error) {
            console.error('Error:', error);
        } 
        
    }, [])
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

    const convertToBase64 = (file: File | Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    const getTimestampMin = () => {
        if (!timestampMax) return
        const timestampMin = new Date(timestampMax)
        timestampMin.setMinutes(timestampMin.getMinutes() - timeWindow)
        return timestampMin.toISOString()
    }

    const fetchVectorData = async () => {
        const response = await fetch('/api/images/embedding', {
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
        setVectorData(data);
    }

    const fetchAllTimesSimilarImages = async () => {
        try {
            setLoadingAllTimes(true);
            const response = await fetch('/api/images/search', {
                method: 'POST',
                body: JSON.stringify({ vectorData: vectorData  }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            } 
            const data = await response.json();
            setAllTimesSimilarImages(data);
            setLoadingAllTimes(false);
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
                body: JSON.stringify({ vectorData: vectorData }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setRecentSimilarImages(data);
            setLoadingRecent(false);
        } catch (error) {
            console.warn('Failed to fetch similar images:', error);
            setRecentSimilarImages([]); // Reset to empty array on error
        }
    }

    const fetchDefaultImage = async () => {
        if (!referenceImages[currentImageIndex]) return

        const response = await fetch(referenceImages[currentImageIndex]);
        const blob = await response.blob();
        const base64 = await convertToBase64(blob);
        const base64String = base64.split(',')[1];
        setImageData(base64String);
        
    };

    useEffect(() => {
        setLoadingRecent(true);
        setLoadingAllTimes(true);
        fetchDefaultImage();
    }, [currentImageIndex])



    useEffect(() => {
        const progressInterval = setInterval(() => {
            setProgress(prev => Math.min(prev + (100 / 600), 100)); // Increment every 100ms
        }, 100);

        const imageTimer = setInterval(() => {
            setCurrentImageIndex((prevIndex) => 
                prevIndex === referenceImages.length - 1 ? 0 : prevIndex + 1
            );
            setProgress(0); // Reset progress when image changes
        }, 60000);

        // Cleanup timers on component unmount
        return () => {
            clearInterval(progressInterval);
            clearInterval(imageTimer);
        };
    }, []);

    useEffect(() => {
        if (!imageData) return
        fetchVectorData();
    }, [imageData])

    useEffect(() => {
        if (!timestampMax) return

        fetchRecentSimilarImages();
    }, [timestampMax])

    useEffect(() => {
        if (!vectorData) return

        setAllTimesSimilarImages([]);
        setRecentSimilarImages([]);
        fetchAllTimesSimilarImages();
        if (timestampMax) {
            fetchRecentSimilarImages();
        }

    }, [vectorData])


    return (
        <div className="overflow-y-auto h-[calc(80vh)]">
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
                    {!userReferenceImage && referenceImages[currentImageIndex] && (
                        <div className="">
                        <img
                            src={referenceImages[currentImageIndex]}
                            alt="Default image"
                            className="object-scale-down w-full p-2 h-40"
                        />
                        <ProgressBar className="h-1" type='small' dir="start" progress={progress}/>
                        </div>
                    )}

                    {userReferenceImage && (
                        <img
                            src={userReferenceImage}
                            alt="Reference image"
                            className="object-scale-down w-full p-2 h-40"
                        />
                    )}
                </div>
                <div>
                    <div className="border border-[#696E79] rounded-lg p-2 mb-4">
                        <div className="mb-2 text-sm">Most similar images (all time)</div>
                        {loadingAllTimes? <div className="flex justify-center items-center w-full min-h-40"><GridLoader color="rgb(250 255 105)" /></div>:
                        <div className="grid grid-cols-3 h-40">
                            {allTimesSimilarImages.map((image, index) => (
                                <div
                                    key={index}
                                >
                                    <img
                                        src={'data:image/jpeg;base64, ' + image.base64_data}
                                        alt={`Similar image ${index}`}
                                        className="object-contain w-full p-2 h-40"
                                    />
                                    {/* <p>Score: {image.score.toFixed(2)}</p> */}
                                </div>
                            ))}
                        </div>}
                    </div>
                    <div className="border border-[#696E79] rounded-lg p-2">
                        <div className="mb-2 text-sm">Most similar images (Last 10 minutes)</div>
                        {loadingRecent? <div className="flex justify-center items-center w-full min-h-40"><GridLoader color="rgb(250 255 105)"/></div>:
                        <div className="grid grid-cols-3 gap-2 h-40">
                            {recentSimilarImages.map((image, index) => (
                                <div
                                    key={index}

                                >
                                    <img
                                        src={'data:image/jpeg;base64, ' + image.base64_data}
                                        alt={`Similar image ${index}`}
                                        className="object-contain w-full p-2 h-40"
                                    />
                                    {/* <p>Score: {image.score.toFixed(2)}</p> */}
                                </div>
                            ))}
                        </div>}
                    </div>
                </div>
            </div>
        </div>
    )
} 
