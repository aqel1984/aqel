'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface AppleBusinessChatProps {
  children?: React.ReactNode
}

export function AppleBusinessChat({ children }: AppleBusinessChatProps) {
  const { toast } = useToast()

  const handleClick = () => {
    // Implementation for Apple Business Chat
    try {
      // Add your Apple Business Chat implementation here
      toast({
        title: "Success",
        description: "Opening Apple Business Chat...",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open Apple Business Chat",
        variant: "destructive",
      })
    }
  }

  return (
    <Button onClick={handleClick} variant="outline" size="sm">
      <MessageCircle className="mr-2 h-4 w-4" />
      {children || "Chat with us"}
    </Button>
  )
}

export default AppleBusinessChat