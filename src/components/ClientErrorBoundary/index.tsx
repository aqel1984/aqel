'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

class ErrorBoundary extends Component<Props, State> {
  override state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary p-4 bg-destructive/10 border border-destructive text-destructive rounded" role="alert">
          <h1 className="text-2xl font-bold mb-2">Oops! Something went wrong.</h1>
          <p>We&apos;re sorry, but an error occurred. Please try again later or contact support if the problem persists.</p>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary