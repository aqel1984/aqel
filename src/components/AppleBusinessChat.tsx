import React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AppleBusinessChatProps {
  style?: "default" | "card" | "minimal"
  variant?: "default" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  buttonText?: string
  className?: string
  productName?: string
}

const AppleBusinessChat: React.FC<AppleBusinessChatProps> = ({
  style = "default",
  variant = "default",
  size = "default",
  buttonText = "Chat with us",
  className,
  productName,
}) => {
  const businessId = process.env['NEXT_PUBLIC_APPLE_BUSINESS_CHAT_ID']

  const handleClick = () => {
    if (!businessId) {
      console.error('Apple Business Chat ID not configured')
      return
    }

    const url = `https://biz-messenger.apple.com/message/${businessId}${
      productName ? `?recipient=${encodeURIComponent(productName)}` : ''
    }`
    window.open(url, '_blank')
  }

  const buttonStyles = cn(
    "flex items-center justify-center",
    style === "card" && "mt-2",
    style === "minimal" && "p-0 h-auto",
    className
  )

  return (
    <Button
      variant={variant}
      size={size}
      className={buttonStyles}
      onClick={handleClick}
    >
      {buttonText}
    </Button>
  )
}

export default AppleBusinessChat;