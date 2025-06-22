import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"

export default function CheckEmailPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full space-y-8">
                <Card>
                    <CardHeader className="text-center">
                        <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                            <Mail className="h-6 w-6 text-blue-600" />
                        </div>
                        <CardTitle className="text-2xl">Check your email</CardTitle>
                        <CardDescription>
                            We've sent you a confirmation link. Please check your email and click the link to activate your account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-sm text-gray-600 mb-4">
                            Didn't receive the email? Check your spam folder or{" "}
                            <Link href="/register" className="text-blue-600 hover:underline">
                                try signing up again
                            </Link>
                        </p>
                        <Link href="/login" className="text-blue-600 hover:underline">
                            Back to login
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
