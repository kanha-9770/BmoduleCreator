"use client"

import type React from "react"
import { useState } from "react"
import { Mail, Phone, Eye, EyeOff, Shield, Lock } from "lucide-react"

interface LoginPageProps {
  onNavigateToSignup: () => void
  onNavigateToForgotPassword: () => void
  onNavigateToOTPVerification: (type: "email" | "mobile", identifier: string) => void
  onLoginSuccess: (userData: any) => void
}

export default function LoginPage({
  onNavigateToSignup,
  onNavigateToForgotPassword,
  onNavigateToOTPVerification,
  onLoginSuccess,
}: LoginPageProps) {
  const [loginType, setLoginType] = useState<"email" | "mobile">("email")
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [useOTP, setUseOTP] = useState(false)

  // Validate phone number in E.164 format (e.g., +917014612375)
  const isValidPhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\+[1-9]\d{1,14}$/
    return phoneRegex.test(phone)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Validate input based on login type
    if (loginType === "mobile" && !isValidPhoneNumber(identifier)) {
      setError("Invalid mobile number format. Please use E.164 format (e.g., +917014612375).")
      setIsLoading(false)
      return
    }

    if (loginType === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
      setError("Invalid email format.")
      setIsLoading(false)
      return
    }

    try {
      if (useOTP) {
        // Send OTP via API
        const response = await fetch("/api/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier,
            type: loginType,
            purpose: "LOGIN", // Normalized to uppercase to match backend
          }),
        })

        const result = await response.json()

        if (result.success) {
          onNavigateToOTPVerification(loginType, identifier)
        } else {
          setError(result.error || "Failed to send OTP. Please try again.")
        }
      } else {
        // Traditional password login
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier,
            password,
          }),
        })

        const result = await response.json()

        if (result.success && result.user) {
          console.log("Login successful:", result.user)
          onLoginSuccess(result.user)
        } else {
          setError(result.error || "Login failed. Please check your credentials.")
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account to continue</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Login Type Toggle */}
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setLoginType("email")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  loginType === "email" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Mail className="w-4 h-4" />
                Email
              </button>
              <button
                type="button"
                onClick={() => setLoginType("mobile")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  loginType === "mobile" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Phone className="w-4 h-4" />
                Mobile
              </button>
            </div>

            {/* Identifier Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {loginType === "email" ? "Email Address" : "Mobile Number"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {loginType === "email" ? (
                    <Mail className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Phone className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <input
                  type={loginType === "email" ? "email" : "tel"}
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder={
                    loginType === "email"
                      ? "Enter your email (e.g., user@example.com)"
                      : "Enter your mobile number (e.g., +917014612375)"
                  }
                />
              </div>
              {loginType === "mobile" && (
                <p className="mt-2 text-sm text-gray-500">
                  Enter your mobile number in E.164 format (e.g., +917014612375).
                </p>
              )}
            </div>

            {/* Password or OTP Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="use-otp"
                  type="checkbox"
                  checked={useOTP}
                  onChange={(e) => setUseOTP(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="use-otp" className="ml-2 block text-sm text-gray-700">
                  Login with OTP instead
                </label>
              </div>
            </div>

            {/* Password Input (only shown when not using OTP) */}
            {!useOTP && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {useOTP ? "Sending OTP..." : "Signing in..."}
                </div>
              ) : useOTP ? (
                "Send OTP"
              ) : (
                "Sign In"
              )}
            </button>

            {/* Forgot Password Link */}
            {!useOTP && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={onNavigateToForgotPassword}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                >
                  Forgot your password?
                </button>
              </div>
            )}
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <button
            type="button"
            onClick={onNavigateToSignup}
            className="w-full border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium hover:border-blue-300 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
          >
            Create New Account
          </button>
        </div>
      </div>
    </div>
  )
}
