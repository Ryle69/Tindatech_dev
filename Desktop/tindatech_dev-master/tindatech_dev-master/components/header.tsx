"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Menu, Search, ShoppingCart, User, Heart } from "lucide-react"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Storefront", href: "/storefront" },
    { name: "Visit", href: "/visit" },
    { name: "About", href: "/about" },
    { name: "FAQ", href: "/faq" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full bg-[#6CB73A] shadow-md">
  <div className="container flex h-16 items-center justify-between px-4">
    <div className="flex items-center gap-6">
      <Link href="/" className="flex items-center space-x-2">
        <img src="/logo.svg" alt="Cheryll's Fashion Boutique Logo" />
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-6">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="text-sm font-medium text-[#F7F1C5] hover:text-white transition-colors"
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </div>

    <div className="flex items-center gap-4 text-[#F7F1C5]">
      {/* Search */}
      <Button
        variant="ghost"
        size="icon"
        className="hidden sm:flex hover:bg-[#F7F1C5] hover:text-[#6CB73A]"
      >
        <Search className="h-4 w-4" />
      </Button>

      {/* Login */}
      <Link href="/login">
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-[#F7F1C5] hover:text-[#6CB73A]"
        >
          <User className="h-4 w-4" />
        </Button>
      </Link>

      {/* Wishlist */}
      <Button
        variant="ghost"
        size="icon"
        className="hover:bg-[#F7F1C5] hover:text-[#6CB73A]"
      >
        <Heart className="h-4 w-4" />
      </Button>

      {/* Cart */}
      <Link href="/cart">
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-[#F7F1C5] hover:text-[#6CB73A]"
        >
          <ShoppingCart className="h-4 w-4" />
          <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-600 text-white">
            3
          </Badge>
        </Button>
      </Link>

      {/* Mobile Menu */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden hover:bg-[#F7F1C5] hover:text-[#6CB73A]"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="w-[300px] sm:w-[400px] bg-white text-[#6CB73A]"
        >
          <nav className="flex flex-col gap-4 mt-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-2 py-2 text-lg font-medium hover:text-[#69AB3C]"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  </div>
</header>

  )
}
