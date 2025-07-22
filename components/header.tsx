"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Menu, Search, ShoppingCart, User, Heart } from "lucide-react"
import { useCart } from "@/contexts/CartContext"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { cartCount, loading } = useCart()

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Storefront", href: "/storefront" },
    { name: "Visit", href: "/visit" },
    { name: "About", href: "/about" },
    { name: "FAQ", href: "/faq" },
    { name: "Contact Us", href: "/contact" },
  ]

  return (
      <header className="sticky top-0 z-50 w-full bg-[#6CB73A]/95 backdrop-blur supports-[backdrop-filter]:bg-[#6CB73A]">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.svg" alt="Cheryll's Fashion Boutique Logo"/>
              {/*<span className="font-bold text-xl">Cheryll's Fashion Boutique</span>*/}
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              {navigation.map((item) => (
                  <Link
                      key={item.name}
                      href={item.href}
                      className="text-sm font-medium transition-colors text-[#D7D2AE] hover:text-[#F7F1C5]"
                  >
                    {item.name}
                  </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4 text-[#D7D2AE]">
            <Button variant="ghost" size="icon" className="hidden sm:flex hover:bg-[#F7F1C5] hover:text-[#69AB3C]">
              <Search className="h-4 w-4" />
            </Button>

            <Link href="/login">
              <Button variant="ghost" size="icon" className="hover:bg-[#F7F1C5] hover:text-[#69AB3C]">
                <User className="h-4 w-4" />
              </Button>
            </Link>

            <Button variant="ghost" size="icon" className="hover:bg-[#F7F1C5] hover:text-[#69AB3C]">
              <Heart className="h-4 w-4" />
            </Button>

            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative hover:bg-[#F7F1C5] hover:text-[#69AB3C]">
                <ShoppingCart className="h-4 w-4" />
                {!loading && cartCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-600">
                      {cartCount > 99 ? '99+' : cartCount}
                    </Badge>
                )}
              </Button>
            </Link>

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden hover:bg-[#F7F1C5] hover:text-[#69AB3C]">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] text-[#A2C078]">
                <nav className="flex flex-col gap-4">
                  {navigation.map((item) => (
                      <Link
                          key={item.name}
                          href={item.href}
                          className="block px-2 py-1 text-lg hover:text-[#69AB3C]"
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