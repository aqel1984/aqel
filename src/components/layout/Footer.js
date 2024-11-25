import React from 'react'
import Link from 'next/link'
import { Facebook, Twitter, Instagram } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-primary text-primary-foreground p-8 mt-8">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h2 className="text-lg font-semibold mb-4">About Us</h2>
            <p className="text-sm">
              Aqel Jehad LTD is a leading supplier of premium raw materials, specializing in shea butter and cocoa butter.
            </p>
          </div>
          <nav aria-label="Footer Navigation">
            <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
            <ul className="space-y-2">
              {['Home', 'Products', 'About', 'Contact'].map((item) => (
                <li key={item}>
                  <Link href={`/${item.toLowerCase()}`} className="text-sm hover:underline">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h2 className="text-lg font-semibold mb-4">Connect With Us</h2>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-primary-foreground/20 text-center">
          <p>&copy; {currentYear} Aqel Jehad LTD. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer