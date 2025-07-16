"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail, MapPin, Phone } from "lucide-react"
import { useFormState } from "react-dom"
import { SubmitButton } from "@/components/submit-button"
import { submitContactForm } from "./actions"

interface FormState {
    success: boolean
    message: string
    errors?: {
        name?: string[]
        email?: string[]
        message?: string[]
    }
}

export default function ContactPage() {
    const [state, formAction] = useFormState<FormState, FormData>(submitContactForm, {
        success: false,
        message: "",
        errors: undefined,
    })

    const contactInfo = [
        {
            icon: <Mail className="h-6 w-6" />,
            title: "Email Us",
            description: "We'll respond quickly",
            value: "kiwangcherryl@gmail.com",
        },
        {
            icon: <Phone className="h-6 w-6" />,
            title: "Call Us",
            description: "Mon-Fri, 9am-5pm EST",
            value: "+1 (555) 123-4567",
        },
        {
            icon: <MapPin className="h-6 w-6" />,
            title: "Visit Us",
            description: "Come say hello",
            value: "123 Main St, New York, NY 10001",
        },
    ]

    return (
        <div className="container px-4 py-8">
            <div className="max-w-6xl mx-auto">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Have questions or feedback? We'd love to hear from you. Fill out the form below or reach out directly.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    {/* Contact Form */}
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Send us a message</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form action={formAction} className="space-y-6">
                                    {state?.message && (
                                        <div className={`p-4 rounded-md ${
                                            state.success
                                                ? "bg-green-50 text-green-600"
                                                : "bg-red-50 text-red-600"
                                        }`}>
                                            {state.message}
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name *</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            placeholder="John Doe"
                                            required
                                        />
                                        {state?.errors?.name && (
                                            <p className="text-sm text-red-600">{state.errors.name}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email *</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="john@example.com"
                                            required
                                        />
                                        {state?.errors?.email && (
                                            <p className="text-sm text-red-600">{state.errors.email}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="message">Message *</Label>
                                        <Textarea
                                            id="message"
                                            name="message"
                                            placeholder="Your message here..."
                                            rows={5}
                                            required
                                        />
                                        {state?.errors?.message && (
                                            <p className="text-sm text-red-600">{state.errors.message}</p>
                                        )}
                                    </div>

                                    <SubmitButton className="w-full">
                                        Send Message
                                    </SubmitButton>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold">Contact Information</h2>
                            <p className="text-gray-600">
                                We're here to help and answer any questions you might have.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {contactInfo.map((info, index) => (
                                <div key={index} className="flex items-start gap-4">
                                    <div className="bg-black text-white p-3 rounded-full">
                                        {info.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-medium">{info.title}</h3>
                                        <p className="text-sm text-gray-500">{info.description}</p>
                                        <p className="text-gray-700">{info.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4">
                            <h3 className="font-medium mb-2">Business Hours</h3>
                            <div className="space-y-1 text-gray-700">
                                <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                                <p>Saturday: 10:00 AM - 4:00 PM</p>
                                <p>Sunday: Closed</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Map Section */}
                <div className="mb-16">
                    <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.215209132773!2d-73.9878449241643!3d40.74844097138984!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1712345678901"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </div>
            </div>
        </div>
    )
}