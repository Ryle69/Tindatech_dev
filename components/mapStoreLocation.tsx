'use client'

import { useEffect, useRef } from 'react'
import { Loader } from '@googlemaps/js-api-loader'

export function MapLocation() {
    const mapRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const initMap = async () => {
            const loader = new Loader({
                apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
                version: 'beta',
                libraries: ['maps', 'marker']
            })

            try {
                const { Map } = await loader.importLibrary('maps')
                const { AdvancedMarkerElement } = await loader.importLibrary('marker')

                // Coordinates of Store
                const position = { lat: 14.117428, lng: 120.962102 }

                const map = new Map(mapRef.current!, {
                    center: position,
                    zoom: 14,
                    mapId: 'DEMO_MAP_ID',
                    disableDefaultUI: true,
                    styles: [
                        {
                            featureType: 'poi',
                            elementType: 'labels',
                            stylers: [{ visibility: 'off' }]
                        }
                    ]
                })

                new AdvancedMarkerElement({
                    map,
                    position,
                    title: 'Our Location'
                })
            } catch (error) {
                console.error('Error loading Google Maps:', error)
            }
        }

        initMap()
    }, [])

    return (
        <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
            <div ref={mapRef} className="w-full h-full" />
        </div>
    )
}