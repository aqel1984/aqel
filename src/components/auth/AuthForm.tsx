'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FaEye, FaEyeSlash } from 'react-icons/fa'

interface AuthFormProps {
  title?: string;
  description?: string;
  showForgotPassword?: boolean;
  showSignUp?: boolean;
  signUpHref?: string;
  onSubmit?: (email: string, password: string) => Promise<void>;
}

export default function AuthForm({
  title = "Login",
  description = "Enter your credentials to access your account",
  showForgotPassword = true,
  showSignUp = true,
  signUpHref = "/signup",
  onSubmit
}: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      if (onSubmit) {
        await onSubmit(email, password)
      } else {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })

        if (!response.ok) {
          throw new Error('Login failed')
        }

        console.log('Login successful')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-gray-500">{description}</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" className="w-full">Login</Button>
      {showForgotPassword && (
        <Button variant="link" className="w-full">Forgot password?</Button>
      )}
      {showSignUp && (
        <p className="text-center">
          Don&apos;t have an account?{' '}
          <a href={signUpHref} className="text-blue-500 hover:underline">
            Sign up
          </a>
        </p>
      )}
    </form>
  )
}