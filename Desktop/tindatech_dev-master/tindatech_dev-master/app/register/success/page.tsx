import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export default function RegistrationSuccessPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full space-y-8">
                <Card>
                    <CardHeader className="text-center">
                        <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl text-green-600">Registration Successful!</CardTitle>
                        <CardDescription>Your account has been created successfully.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <p className="text-sm text-gray-600">You can now sign in to your account and start shopping.</p>
                        <Link href="/login" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                            Go to Login
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
