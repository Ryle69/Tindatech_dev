import Link from "next/link"
import { Facebook, Instagram, Twitter, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[#6CB73A] text-black">
      <div className="container px-8 py-12">
        <div className="grid grid-cols-1 justify-items-center sm:justify-items-start sm:grid-cols-4 gap-8 sm:space-x-12 md:space-x-32">
          <div className="space-y-4 justify-items-center md:justify-items-start">
            <div className="flex justify-center md:justify-start w-full space-x-2">
              <img
                  src="/logo-expanded.svg"
                  alt="Cheryll's Fashion Boutique Logo"
                  className="w-full max-w-[150px] h-auto"
              />
            </div>
            <p className="text-sm">Style that works as hard as your budget does.</p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 hover:text-[#D7D2AE] cursor-pointer" />
              <Instagram className="h-5 w-5 hover:text-[#D7D2AE] cursor-pointer" />
              <Twitter className="h-5 w-5 hover:text-[#D7D2AE] cursor-pointer" />
              <Mail className="h-5 w-5 hover:text-[#D7D2AE] cursor-pointer" />
            </div>
          </div>
          <div className="flex flex-col items-center space-y-8 py-12 sm:py-0 sm:-mx-6 sm:space-y-0 sm:items-start sm:justify-start sm:flex-row sm:space-x-16">
            <div className="text-center sm:text-start">
              <h3 className="font-semibold mb-4">Shop</h3>
              <ul className="space-y-2 text-sm text-black/50">
                <li>
                  <Link href="/storefront" className="hover:text-black">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link href="/storefront?category=new" className="hover:text-black">
                    New Arrivals
                  </Link>
                </li>
                <li>
                  <Link href="/storefront?category=sale" className="hover:text-black">
                    Sale
                  </Link>
                </li>
                <li>
                  <Link href="/storefront?category=featured" className="hover:text-black">
                    Featured
                  </Link>
                </li>
              </ul>
            </div>
            <div className="text-center sm:text-start">
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-black/50">
                <li>
                  <Link href="/faq" className="hover:text-black">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-black">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="hover:text-black">
                    Shipping Info
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="hover:text-black">
                    Returns
                  </Link>
                </li>
              </ul>
            </div>
            <div className="text-center sm:text-start">
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-black/50">
                <li>
                  <Link href="/about" className="hover:text-black/80">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/visit" className="hover:text-black/80">
                    Visit Our Store
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-black/80">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="py-6 bg-[#da6304] mt-8 text-center text-sm text-black">
        <p>&copy; 2025 Cheryll's Fashion Boutique. All rights reserved.</p>
      </div>
    </footer>
  )
}
