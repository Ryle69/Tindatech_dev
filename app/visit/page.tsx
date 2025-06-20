import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Clock, Phone, Mail, Car, Train, Bus } from "lucide-react"

export default function VisitPage() {
  return (
    <div className="container px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Visit Our Store</h1>
          <p className="text-xl text-gray-600">Experience our products in person at our flagship location</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Store Image */}
          <div>
            <Image
              src="/placeholder.svg?height=400&width=600"
              alt="Modern Store Interior"
              width={600}
              height={400}
              className="w-full h-80 object-cover rounded-lg shadow-lg"
            />
          </div>

          {/* Store Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  123 Modern Street
                  <br />
                  Downtown District
                  <br />
                  New York, NY 10001
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Store Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-gray-600">
                  <div className="flex justify-between">
                    <span>Monday - Friday:</span>
                    <span>10:00 AM - 8:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday:</span>
                    <span>10:00 AM - 9:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday:</span>
                    <span>12:00 PM - 6:00 PM</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>(555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>store@modernstore.com</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Getting Here Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Getting Here</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  By Car
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Convenient parking available in our underground garage.</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 2 hours free parking</li>
                  <li>• Valet service available</li>
                  <li>• EV charging stations</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Train className="h-5 w-5" />
                  By Subway
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Multiple subway lines stop nearby.</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 14th St-Union Sq (4,5,6,L,N,Q,R,W)</li>
                  <li>• 5 minute walk</li>
                  <li>• Accessible entrance</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bus className="h-5 w-5" />
                  By Bus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Several bus routes serve the area.</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• M14A, M14D bus lines</li>
                  <li>• Bus stop directly outside</li>
                  <li>• Real-time arrival info</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Find Us</h2>
          <div className="bg-gray-200 h-96 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MapPin className="h-12 w-12 mx-auto mb-4" />
              <p>Interactive map would be embedded here</p>
              <p className="text-sm">123 Modern Street, New York, NY 10001</p>
            </div>
          </div>
        </div>

        {/* Store Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Store Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🛍️</span>
              </div>
              <h3 className="font-semibold mb-2">Personal Shopping</h3>
              <p className="text-sm text-gray-600">Expert stylists available by appointment</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">📱</span>
              </div>
              <h3 className="font-semibold mb-2">Tech Demo Area</h3>
              <p className="text-sm text-gray-600">Try before you buy in our demo zone</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">☕</span>
              </div>
              <h3 className="font-semibold mb-2">Café Corner</h3>
              <p className="text-sm text-gray-600">Complimentary coffee while you shop</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🎁</span>
              </div>
              <h3 className="font-semibold mb-2">Gift Wrapping</h3>
              <p className="text-sm text-gray-600">Free premium gift wrapping service</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gray-50 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Plan Your Visit</h2>
          <p className="text-gray-600 mb-6">
            Book a personal shopping appointment or just drop by during our store hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">Book Appointment</Button>
            <Button size="lg" variant="outline">
              Get Directions
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
