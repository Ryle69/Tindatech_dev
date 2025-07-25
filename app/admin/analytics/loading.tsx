import Image from "next/image"

export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="flex flex-col items-center space-y-4">
                <Image
                    src="/logo.svg"
                    alt="Loading Logo"
                    width={64}
                    height={64}
                    className="animate-pulse"
                />
                <p className="text-gray-700 text-lg font-medium">Loading Page...</p>
            </div>
        </div>
    )
}
