// components/ProductImages.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function ProductImages({ product }: { product: { name: string; images: string[] } }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [erroredImages, setErroredImages] = useState<Record<number, boolean>>({})

    if (!product?.images?.length) {
        return <div className="h-96 bg-gray-200 animate-pulse rounded-lg" />
    }

    const handleImageError = (index: number) => {
        setErroredImages(prev => ({ ...prev, [index]: true }))
    }

    return (
        <div className="space-y-4">
            {/* Main image */}
            <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                {erroredImages[currentImageIndex] ? (
                    <img
                        src="/placeholder.svg"
                        alt={`${product.name} - Fallback Image`}
                        className="w-full h-full object-cover"
                        loading="eager"
                    />
                ) : (
                    <Image
                        src={product.images[currentImageIndex]}
                        alt={`${product.name} - Image ${currentImageIndex + 1}`}
                        fill
                        className="object-cover"
                        priority
                        unoptimized
                        loading="eager"
                        onError={() => handleImageError(currentImageIndex)}
                    />
                )}
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-2">
                {product.images.map((url, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`relative aspect-square overflow-hidden rounded border-2 ${
                            index === currentImageIndex ? 'border-primary' : 'border-transparent'
                        }`}
                    >
                        {erroredImages[index] ? (
                            <img
                                src="/placeholder.svg"
                                alt={`Fallback Thumbnail ${index + 1}`}
                                className="w-full h-full object-cover"
                                loading="eager"
                            />
                        ) : (
                            <Image
                                src={url}
                                alt={`Thumbnail ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="100px"
                                unoptimized
                                loading="eager"
                                onError={() => handleImageError(index)}
                            />
                        )}
                    </button>
                ))}
            </div>
        </div>
    )
}