'use client'

import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SearchIcon } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

export function SearchDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setIsSearching(true)
    setError(null)
    try {
      // Implement your search logic here
      console.log('Searching for:', searchQuery)
      // Simulating a search delay
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error('Search error:', error)
      setError('An error occurred while searching. Please try again.')
    } finally {
      setIsSearching(false)
      setIsOpen(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Open search">
          <SearchIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSearch} className="flex flex-col gap-2">
          <Input
            type="search"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search query"
          />
          <Button type="submit" disabled={isSearching || !searchQuery.trim()}>
            {isSearching ? <Spinner className="h-4 w-4" /> : 'Search'}
            <span className="sr-only">{isSearching ? 'Searching' : 'Submit search'}</span>
          </Button>
          {error && <p role="alert" className="text-red-500">{error}</p>}
        </form>
      </DialogContent>
    </Dialog>
  )
}