interface Window {
  Microsoft?: {
    Dynamics365?: {
      PostMessageRelay: {
        postMessage: (message: {
          type: string
          eventName: string
          [key: string]: any
        }) => void
      }
    }
  }
  gtag?: (
    command: 'event',
    action: string,
    params: Record<string, any>
  ) => void
}
