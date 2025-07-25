import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Award, Globe, Heart } from "lucide-react"

export default function AboutPage() {
  const values = [
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Customer First",
      description:
          "Every decision we make is guided by what's best for our customers. Your satisfaction is our top priority.",
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Quality Excellence",
      description: "We curate only the finest products that meet our rigorous standards for quality and craftsmanship.",
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Sustainability",
      description:
          "We're committed to responsible business practices and supporting brands that care about our planet.",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community",
      description:
          "We believe in building lasting relationships with our customers, partners, and the communities we serve.",
    },
  ]

  const team = [
    {
      name: "Florida Kiwang",
      role: "Co-owner",
      image: "/placeholder.svg?height=300&width=300",
      bio: "",
    },
    {
      name: "Christopher Kiwang",
      role: "Co-owner",
      image: "/placeholder.svg?height=300&width=300",
      bio: "",
    },
  ]

  const milestones = [
    { year: "2018", event: "Modern Store founded with a single product line" },
    { year: "2019", event: "Reached 10,000 satisfied customers" },
    { year: "2020", event: "Launched international shipping to 25 countries" },
    { year: "2021", event: "Opened our first physical store in New York" },
    { year: "2022", event: "Achieved carbon-neutral shipping" },
    { year: "2023", event: "Expanded to 50+ countries worldwide" },
    { year: "2024", event: "Celebrating 100,000+ happy customers" },
  ]

  return (
      <div className="container px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Badge className="mb-4">About Us</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Redefining Shopping</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're a proudly Filipino thrift store that believes secondhand doesn't mean second best. Every rack holds stories, every piece is handpicked, and every visit is a step toward sustainable, stylish, and affordable fashion — all while supporting the local community.
            </p>
          </div>



          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Born in the heart of the Philippines, our thrift store was built from a passion for unique finds, sustainability, and community spirit. What started as a humble collection of pre-loved clothes has grown into a destination for style-savvy shoppers looking for both value and character. </p>
                <p>
                  We believe fashion doesn’t have to be fast or wasteful. Each item in our store is handpicked with love — giving garments a second chance while helping our customers express themselves creatively and affordably.
                </p>
                <p>
                  Whether you’re here for a vintage denim jacket, a one-of-a-kind dress, or just looking to support local, we thank you for being part of our journey. Together, we make fashion more meaningful — one thrifted piece at a time.
                </p>
              </div>
            </div>
            <div>
              <Image
                  src="/shop.jpg"
                  alt="Modern Store Team"
                  width={600}
                  height={500}
                  className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>

          {/* Values Section */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                  <Card key={index} className="text-center">
                    <CardHeader>
                      <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                        {value.icon}
                      </div>
                      <CardTitle>{value.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{value.description}</p>
                    </CardContent>
                  </Card>
              ))}
            </div>
          </div>

          <div className="mb-16">
            {/*<div className="text-center mb-12">*/}
            {/*  <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>*/}
            {/*</div>*/}
            {/*<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">*/}
            {/*  {team.map((member, index) => (*/}
            {/*      <Card key={index} className="text-center">*/}
            {/*        <CardContent className="p-6">*/}
            {/*          <Image*/}
            {/*              src={member.image || "/placeholder.svg"}*/}
            {/*              alt={member.name}*/}
            {/*              width={200}*/}
            {/*              height={200}*/}
            {/*              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"*/}
            {/*          />*/}
            {/*          <h3 className="font-semibold text-lg mb-1">{member.name}</h3>*/}
            {/*          <p className="text-sm text-gray-500 mb-3">{member.role}</p>*/}
            {/*          <p className="text-sm text-gray-600">{member.bio}</p>*/}
            {/*        </CardContent>*/}
            {/*      </Card>*/}
            {/*  ))}*/}
            {/*</div>*/}
          </div>

          {/*<div className="mb-16">*/}
          {/*  <div className="text-center mb-12">*/}
          {/*    <h2 className="text-3xl font-bold mb-4">Our Journey</h2>*/}
          {/*    <p className="text-gray-600 max-w-2xl mx-auto">*/}
          {/*      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.*/}
          {/*    </p>*/}
          {/*  </div>*/}

          {/*</div>*/}

          {/*<div className="bg-gray-50 p-8 rounded-lg mb-16">*/}
          {/*  <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">*/}
          {/*    <div>*/}
          {/*      <div className="text-4xl font-bold text-black mb-2">10K+</div>*/}
          {/*      <p className="text-gray-600">Happy Customers</p>*/}
          {/*    </div>*/}
          {/*    <div>*/}
          {/*      <div className="text-4xl font-bold text-black mb-2">50+</div>*/}
          {/*      <p className="text-gray-600">Places Served</p>*/}
          {/*    </div>*/}
          {/*    <div>*/}
          {/*      <div className="text-4xl font-bold text-black mb-2">1000+</div>*/}
          {/*      <p className="text-gray-600">Premium Products</p>*/}
          {/*    </div>*/}
          {/*    <div>*/}
          {/*      <div className="text-4xl font-bold text-black mb-2">99%</div>*/}
          {/*      <p className="text-gray-600">Customer Satisfaction</p>*/}
          {/*    </div>*/}
          {/*  </div>*/}
          {/*</div>*/}

          <div className="text-center bg-black text-white p-12 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Have questions, feedback, or just want to say hello? We'd love to hear from you! Reach out to us through any of the methods below.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                  href="mailto:kiwangcherryl@gmail.com"
                  className="bg-white text-black px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors"
              >
                Contact Us
              </a>
              <a
                  href="/visit"
                  className="border border-white text-white px-6 py-3 rounded-md font-medium hover:bg-white hover:text-black transition-colors"
              >
                Visit Our Store
              </a>
            </div>
          </div>
        </div>
      </div>

  )
}
