'use client'

import { useEffect } from 'react'

interface ChatConfig {
  license: string
  group?: string
}

interface ChatWidgetType {
  init: () => void
  call: (method: string, params: unknown[]) => void
}

declare global {
  interface Window {
    LiveChatWidget?: ChatWidgetType
  }
}

export function LiveChatWidget({ license, group }: ChatConfig) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initChat = () => {
      if (window.LiveChatWidget) {
        try {
          window.LiveChatWidget.init()
          if (group) {
            window.LiveChatWidget.call('set_groups', [group])
          }
        } catch (error) {
          console.error('Error initializing LiveChatWidget:', error)
        }
      } else {
        console.warn('LiveChatWidget not found on window object')
      }
    }

    // Load the LiveChatWidget script
    const script = document.createElement('script')
    script.src = `https://cdn.livechatinc.com/tracking.js`
    script.async = true
    script.onload = initChat
    document.head.appendChild(script)

    return () => {
      // Clean up the script when the component unmounts
      document.head.removeChild(script)
    }
  }, [license, group])

  return null
}