"use client"

import { useState } from "react"
import LoginPage from "./login-page"
import SignupPage from "./signup-page"
import ForgotPasswordPage from "./forgot-password-page"
import OTPVerificationPage from "./otp-verification-page"

export type AuthView = "login" | "signup" | "forgot-password" | "otp-verification" | "success"

interface OTPData {
  type: "email" | "mobile"
  identifier: string
  purpose: "registration" | "login" | "password_reset"
  userData?: any
}

interface AuthContainerProps {
  onAuthSuccess: (userData: any) => void
}

export default function AuthContainer({ onAuthSuccess }: AuthContainerProps) {
  const [currentView, setCurrentView] = useState<AuthView>("login")
  const [otpData, setOtpData] = useState<OTPData | null>(null)

  const handleNavigateToSignup = () => setCurrentView("signup")
  const handleNavigateToLogin = () => setCurrentView("login")
  const handleNavigateToForgotPassword = () => setCurrentView("forgot-password")

  const handleNavigateToOTPVerification = (
    type: "email" | "mobile",
    identifier: string,
    userData?: any,
    purpose: "registration" | "login" | "password_reset" = "registration",
  ) => {
    setOtpData({ type, identifier, purpose, userData })
    setCurrentView("otp-verification")
  }

  const handleOTPVerificationSuccess = (userData?: any) => {
    console.log("Verification successful:", userData)
    onAuthSuccess(userData || otpData?.userData)
  }

  const handleBackFromOTP = () => {
    if (otpData?.purpose === "registration") {
      setCurrentView("signup")
    } else if (otpData?.purpose === "login") {
      setCurrentView("login")
    } else if (otpData?.purpose === "password_reset") {
      setCurrentView("forgot-password")
    }
  }

  const handleLoginSuccess = (userData: any) => {
    onAuthSuccess(userData)
  }

  if (currentView === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-6 shadow-xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {otpData?.purpose === "registration" && "Welcome Aboard! 🎉"}
            {otpData?.purpose === "login" && "Welcome Back! 👋"}
            {otpData?.purpose === "password_reset" && "Password Reset Complete! ✅"}
          </h1>
          <p className="text-gray-600 mb-8">
            {otpData?.purpose === "registration" && "Your account has been successfully created and verified."}
            {otpData?.purpose === "login" && "You have been successfully logged in."}
            {otpData?.purpose === "password_reset" && "You can now log in with your new password."}
          </p>
          <button
            onClick={() => setCurrentView("login")}
            className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-8 rounded-xl font-medium hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {otpData?.purpose === "password_reset" ? "Go to Login" : "Continue to Dashboard"}
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {currentView === "login" && (
        <LoginPage
          onNavigateToSignup={handleNavigateToSignup}
          onNavigateToForgotPassword={handleNavigateToForgotPassword}
          onNavigateToOTPVerification={(type, identifier) =>
            handleNavigateToOTPVerification(type, identifier, undefined, "login")
          }
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {currentView === "signup" && (
        <SignupPage
          onNavigateToLogin={handleNavigateToLogin}
          onNavigateToOTPVerification={(type, identifier, userData) =>
            handleNavigateToOTPVerification(type, identifier, userData, "registration")
          }
        />
      )}

      {currentView === "forgot-password" && (
        <ForgotPasswordPage
          onNavigateToLogin={handleNavigateToLogin}
          onNavigateToOTPVerification={(type, identifier) =>
            handleNavigateToOTPVerification(type, identifier, undefined, "password_reset")
          }
        />
      )}

      {currentView === "otp-verification" && otpData && (
        <OTPVerificationPage
          type={otpData.type}
          identifier={otpData.identifier}
          purpose={otpData.purpose}
          userData={otpData.userData}
          onNavigateBack={handleBackFromOTP}
          onVerificationSuccess={handleOTPVerificationSuccess}
        />
      )}
    </>
  )
}
  