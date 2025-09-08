"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Mail, Phone, ArrowLeft, CheckCircle, RefreshCw } from "lucide-react";

interface OTPVerificationPageProps {
  type: "email" | "mobile";
  identifier: string;
  purpose: "registration" | "login" | "password_reset";
  userData?: any;
  onNavigateBack: () => void;
  onVerificationSuccess: (userData?: any) => void;
}

export default function OTPVerificationPage({
  type,
  identifier,
  purpose,
  userData,
  onNavigateBack,
  onVerificationSuccess,
}: OTPVerificationPageProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const otpArray = value.slice(0, 6).split("");
      const newOtp = [...otp];
      otpArray.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);

      // Focus the next empty input or the last input
      const nextIndex = Math.min(index + otpArray.length, 5);
      inputRefs.current[nextIndex]?.focus();
    } else {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move to next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Move to previous input on backspace
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      // Verify OTP via API
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier,
          code: otpCode,
          purpose,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || "Invalid verification code");
        return;
      }

      // Success
      onVerificationSuccess(userData);
    } catch (err) {
      setError("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setError("");

    try {
      // Resend OTP via API
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier,
          type,
          purpose,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || "Failed to resend code");
        return;
      }

      // Reset timer
      setTimeLeft(300);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);

      // Focus first input
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError("Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const getPurposeText = () => {
    switch (purpose) {
      case "registration":
        return "verify your account";
      case "login":
        return "sign in";
      case "password_reset":
        return "reset your password";
      default:
        return "verify";
    }
  };

  const getGradientColors = () => {
    switch (purpose) {
      case "registration":
        return "from-green-600 to-blue-600";
      case "login":
        return "from-blue-600 to-indigo-600";
      case "password_reset":
        return "from-purple-600 to-pink-600";
      default:
        return "from-blue-600 to-indigo-600";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${getGradientColors()} rounded-2xl mb-4 shadow-lg`}
          >
            {type === "email" ? (
              <Mail className="w-8 h-8 text-white" />
            ) : (
              <Phone className="w-8 h-8 text-white" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Verify Your {type === "email" ? "Email" : "Phone"}
          </h1>
          <p className="text-gray-600">
            Enter the 6-digit code sent to{" "}
            <span className="font-medium text-gray-900">
              {type === "email"
                ? identifier
                : `${identifier.slice(0, -4).replace(/./g, "*")}${identifier.slice(
                    -4
                  )}`}
            </span>
          </p>
        </div>

        {/* OTP Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="mb-6">
            <button
              onClick={onNavigateBack}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                Verification Code
              </label>
              <div className="flex justify-center gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    autoComplete="off"
                  />
                ))}
              </div>
            </div>

            {/* Timer */}
            <div className="text-center">
              {timeLeft > 0 ? (
                <p className="text-sm text-gray-600">
                  Code expires in{" "}
                  <span className="font-medium text-gray-900">
                    {formatTime(timeLeft)}
                  </span>
                </p>
              ) : (
                <p className="text-sm text-red-600">Code has expired</p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-sm text-red-600 text-center">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || otp.join("").length !== 6}
              className={`w-full bg-gradient-to-r ${getGradientColors()} text-white py-3 px-4 rounded-xl font-medium hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Verifying...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Verify & {getPurposeText()}
                </div>
              )}
            </button>

            {/* Resend Code */}
            <div className="text-center">
              {canResend || timeLeft === 0 ? (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isResending}
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 disabled:opacity-50"
                >
                  {isResending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Resend Code
                    </>
                  )}
                </button>
              ) : (
                <p className="text-sm text-gray-500">
                  Didn't receive the code? You can resend in{" "}
                  {formatTime(timeLeft)}
                </p>
              )}
            </div>
          </form>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-600 text-center">
              Having trouble? Check your spam folder or ensure your{" "}
              {type === "email" ? "email address" : "phone number"} is correct.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}