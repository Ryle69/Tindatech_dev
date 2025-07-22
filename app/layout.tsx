import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CartProvider } from '@/contexts/CartContext'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Cheryll's Fashion Boutique",
  description: "",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#D7D2AE] font-rubik`}>
      <CartProvider>
          <style>
              @import url('https://fonts.googleapis.com/css2?family=Mouse+Memoirs&family=Rubik:ital,wght@0,300..900;1,300..900&display=swap');
          </style>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
      </CartProvider>
      </body>
    </html>
  )
}
