import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, Mail, Phone } from "lucide-react"

export default function FAQPage() {
  const faqs = [
    {
      question: "What is your return policy?",
      answer:
        "We offer a 30-day return policy for all items in original condition. Items must be unused and in original packaging. Return shipping is free for defective items, and we provide prepaid return labels for exchanges.",
    },
    {
      question: "How long does shipping take?",
      answer:
        "Standard shipping takes 3-5 business days. Express shipping (1-2 business days) and overnight shipping are also available. Free shipping is offered on orders over $100.",
    },
    {
      question: "Do you ship internationally?",
      answer:
        "Yes, we ship to over 50 countries worldwide. International shipping times vary by location (5-14 business days). Customs duties and taxes may apply and are the responsibility of the customer.",
    },
    {
      question: "How can I track my order?",
      answer:
        "Once your order ships, you'll receive a tracking number via email. You can also track your order by logging into your account and viewing your order history.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, Google Pay, and Shop Pay. All payments are processed securely.",
    },
    {
      question: "Can I modify or cancel my order?",
      answer:
        "Orders can be modified or cancelled within 1 hour of placement. After this time, orders enter our fulfillment process and cannot be changed. Please contact customer service immediately if you need to make changes.",
    },
    {
      question: "Do you offer price matching?",
      answer:
        "Yes, we offer price matching on identical items from authorized retailers. The item must be in stock and the price must be verifiable. Contact us with the details and we'll match the price.",
    },
    {
      question: "How do I care for my products?",
      answer:
        "Care instructions vary by product. Detailed care information is included with each item and available on product pages. For electronics, we recommend following manufacturer guidelines.",
    },
    {
      question: "Do you have a loyalty program?",
      answer:
        "Yes! Our Modern Rewards program offers points for every purchase, exclusive member discounts, early access to sales, and special birthday offers. Sign up is free and you earn points immediately.",
    },
    {
      question: "What if I receive a damaged item?",
      answer:
        "We're sorry if you received a damaged item. Please contact us within 48 hours with photos of the damage. We'll arrange for a replacement or full refund, including return shipping costs.",
    },
  ]

  const categories = [
    {
      title: "Orders & Shipping",
      icon: "📦",
      description: "Questions about placing orders, shipping times, and tracking",
    },
    {
      title: "Returns & Exchanges",
      icon: "🔄",
      description: "Information about our return policy and exchange process",
    },
    {
      title: "Products & Care",
      icon: "🛍️",
      description: "Product information, sizing, and care instructions",
    },
    {
      title: "Account & Rewards",
      icon: "👤",
      description: "Managing your account and loyalty program benefits",
    },
  ]

  return (
    <div className="container px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600">Find answers to common questions about shopping with Modern Store</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {categories.map((category, index) => (
            <Card key={index} className="text-center hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="text-3xl mb-2">{category.icon}</div>
                <CardTitle className="text-lg">{category.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{category.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Common Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-gray-600">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="bg-gray-50 p-8 rounded-lg">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
            <p className="text-gray-600">
              Can't find what you're looking for? Our customer support team is here to help.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="text-center">
                <MessageCircle className="h-8 w-8 mx-auto mb-2" />
                <CardTitle>Live Chat</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-gray-600 mb-4">Chat with our support team in real-time</p>
                <Button className="w-full">Start Chat</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Mail className="h-8 w-8 mx-auto mb-2" />
                <CardTitle>Email Support</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-gray-600 mb-4">Send us an email and we'll respond within 24 hours</p>
                <Button variant="outline" className="w-full">
                  Send Email
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Phone className="h-8 w-8 mx-auto mb-2" />
                <CardTitle>Phone Support</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-gray-600 mb-4">Call us Monday-Friday, 9AM-6PM EST</p>
                <Button variant="outline" className="w-full">
                  (555) 123-4567
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
