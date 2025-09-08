"use client"

import type React from "react"
import { useState } from "react"
import { Mail, Phone, ArrowLeft, KeyRound } from "lucide-react"

interface ForgotPasswordPageProps {
  onNavigateToLogin: () => void
  onNavigateToOTPVerification: (type: "email" | "mobile", identifier: string) => void
}

export default function ForgotPasswordPage({
  onNavigateToLogin,
  onNavigateToOTPVerification,
}: ForgotPasswordPageProps) {
  const [resetType, setResetType] = useState<"email" | "mobile">("email")
  const [identifier, setIdentifier] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Validate input
      if (resetType === "email" && !/\S+@\S+\.\S+/.test(identifier)) {
        throw new Error("Please enter a valid email address")
      }
      if (resetType === "mobile" && !/^\+?[\d\s-()]+$/.test(identifier)) {
        throw new Error("Please enter a valid mobile number")
      }

      // Send OTP via API
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier,
          type: resetType,
          purpose: "password_reset",
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to send reset code")
      }

      // Navigate to OTP verification
      onNavigateToOTPVerification(resetType, identifier)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl mb-4 shadow-lg">
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
          <p className="text-gray-600">Enter your details to receive a reset code</p>
        </div>

        {/* Reset Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="mb-6">
            <button
              onClick={onNavigateToLogin}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Reset Type Toggle */}
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setResetType("email")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  resetType === "email" ? "bg-white text-purple-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Mail className="w-4 h-4" />
                Email
              </button>
              <button
                type="button"
                onClick={() => setResetType("mobile")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  resetType === "mobile" ? "bg-white text-purple-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Phone className="w-4 h-4" />
                Mobile
              </button>
            </div>

            {/* Identifier Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {resetType === "email" ? "Email Address" : "Mobile Number"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {resetType === "email" ? (
                    <Mail className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Phone className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <input
                  type={resetType === "email" ? "email" : "tel"}
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder={
                    resetType === "email" ? "Enter your registered email" : "Enter your registered mobile number"
                  }
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <p className="text-sm text-purple-700">
                We'll send a verification code to your {resetType === "email" ? "email address" : "mobile number"} to
                confirm your identity before allowing you to reset your password.
              </p>
            </div>

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
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending Code...
                </div>
              ) : (
                "Send Reset Code"
              )}
            </button>
          </form>

          {/* Alternative Options */}
          <div className="mt-6 space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Remember your password?</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onNavigateToLogin}
              className="w-full border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium hover:border-purple-300 hover:text-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
