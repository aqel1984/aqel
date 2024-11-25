'use client'

import React from 'react'
import { MoonIcon, SunIcon, ShoppingCartIcon, SearchIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"

const IconExample: React.FC = () => {
  return (
    <div className="flex space-x-4" role="toolbar" aria-label="Page actions">
      <Button variant="outline" size="icon" aria-label="Toggle dark mode">
        <MoonIcon className="h-[1.2rem] w-[1.2rem]" aria-hidden="true" />
      </Button>
      <Button variant="outline" size="icon" aria-label="Toggle light mode">
        <SunIcon className="h-[1.2rem] w-[1.2rem]" aria-hidden="true" />
      </Button>
      <Button variant="outline" size="icon" aria-label="View shopping cart">
        <ShoppingCartIcon className="h-[1.2rem] w-[1.2rem]" aria-hidden="true" />
      </Button>
      <Button variant="outline" size="icon" aria-label="Search">
        <SearchIcon className="h-[1.2rem] w-[1.2rem]" aria-hidden="true" />
      </Button>
    </div>
  )
}

export default IconExample