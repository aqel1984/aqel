'use client'

import React from 'react'
import AuthForm from './AuthForm'
import { SignInWithAppleButton } from './SignInWithAppleButton'

export function AuthExamples() {
  const handleCustomAuth = async (email: string, password: string) => {
    console.log('Custom auth with:', email, password)
    // Implement your custom authentication logic here
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-4 bg-gray-100">
      <h1 className="text-3xl font-bold text-gray-800">Auth Form Examples</h1>

      <div className="w-full max-w-md">
        <h2 className="text-xl font-semibold mb-2 text-gray-700">Default Login Form</h2>
        <AuthForm />
      </div>

      <div className="w-full max-w-md">
        <h2 className="text-xl font-semibold mb-2 text-gray-700">Sign Up Form</h2>
        <AuthForm 
          title="Sign Up" 
          description="Create your account" 
          showForgotPassword={false}
          signUpHref="/login"
        />
      </div>

      <div className="w-full max-w-md">
        <h2 className="text-xl font-semibold mb-2 text-gray-700">Password Reset Form</h2>
        <AuthForm 
          title="Reset Password" 
          description="Enter your email to reset your password"
          showForgotPassword={false}
          showSignUp={false}
        />
      </div>

      <div className="w-full max-w-md">
        <h2 className="text-xl font-semibold mb-2 text-gray-700">Custom Authentication Form</h2>
        <AuthForm 
          title="Authenticate" 
          description="Verify your identity"
          onSubmit={handleCustomAuth}
          showForgotPassword={false}
          showSignUp={false}
        />
      </div>

      <div className="w-full max-w-md">
        <h2 className="text-xl font-semibold mb-2 text-gray-700">Sign In with Apple</h2>
        <SignInWithAppleButton />
      </div>
    </div>
  )
}

export default AuthExamples