"use client"

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { VerifyOTPSchema } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Shield, ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import type { z } from 'zod'

type VerifyOTPFormData = z.infer<typeof VerifyOTPSchema>

export default function VerifyOTPPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const userId = searchParams.get('userId')
  const type = searchParams.get('type') || 'REGISTRATION'

  const form = useForm<VerifyOTPFormData>({
    resolver: zodResolver(VerifyOTPSchema),
    defaultValues: {
      otp: '',
    },
  })

  useEffect(() => {
    if (!userId) {
      router.push('/register')
    }
  }, [userId, router])

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) return

    const newOTP = form.getValues('otp').split('')
    newOTP[index] = value
    form.setValue('otp', newOTP.join(''))

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !e.currentTarget.value && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const onSubmit = async (data: VerifyOTPFormData) => {
    if (!userId) return

    setIsLoading(true)
    
    console.log('Submitting OTP verification:', { otp: data.otp, userId, type })

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          userId,
          type,
        }),
      })

      const result = await response.json()
      console.log('OTP verification response:', result)

      if (!response.ok) {
        console.error('OTP verification failed:', result)
        toast({
          title: 'Verification Failed',
          description: result.error || 'Invalid verification code',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Success!',
        description: 'Email verified successfully',
      })

      // Force redirect to dashboard with replace and refresh
      setTimeout(() => {
      window.location.href = '/profile'
      }, 100)
    } catch (error) {
      console.error('Network error during OTP verification:', error)
      toast({
        title: 'Error',
        description: 'Network error. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resendOTP = async () => {
    if (!userId || timeLeft > 0 || isResending) return

    setIsResending(true)

    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          type: type.toLowerCase(),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast({
          title: 'Error',
          description: result.error || 'Failed to resend code',
          variant: 'destructive',
        })
        return
      }

      if (result.success) {
        toast({
          title: 'Code Sent',
          description: result.message || 'A new verification code has been sent to your email',
        })
        setTimeLeft(60) // 1 minute cooldown
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to resend code',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resend code. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsResending(false)
    }
  }

  const otpValue = form.watch('otp')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center bg-green-600 rounded-full mb-4">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Verify Your Email
          </h1>
          <p className="mt-2 text-gray-600">
            Enter the 6-digit code sent to your email address
          </p>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold">Enter Verification Code</CardTitle>
            <CardDescription>
              The code will expire in 10 minutes for security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Verification Code</FormLabel>
                      <FormControl>
                        <div className="flex justify-center space-x-3">
                          {[0, 1, 2, 3, 4, 5].map((index) => (
                            <Input
                              key={index}
                              ref={(el) => (inputRefs.current[index] = el)}
                              type="text"
                              maxLength={1}
                              className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                              value={otpValue[index] || ''}
                              onChange={(e) => handleOTPChange(index, e.target.value)}
                              onKeyDown={(e) => handleKeyDown(index, e)}
                              disabled={isLoading}
                            />
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 hover:scale-[1.02]"
                  disabled={isLoading || otpValue.length !== 6}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    'Verify Email'
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center space-y-3">
              <button
                onClick={resendOTP}
                disabled={timeLeft > 0 || isResending}
                className="text-sm text-blue-600 hover:text-blue-500 font-medium disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isResending ? (
                  <div className="flex items-center space-x-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Resending...</span>
                  </div>
                ) : timeLeft > 0 ? (
                  `Resend code in ${timeLeft}s`
                ) : (
                  <div className="flex items-center space-x-1">
                    <RefreshCw className="h-3 w-3" />
                    <span>Resend verification code</span>
                  </div>
                )}
              </button>

              <div>
                <Link 
                  href="/register" 
                  className="inline-flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-500 transition-colors"
                >
                  <ArrowLeft className="h-3 w-3" />
                  <span>Back to registration</span>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Didn't receive the code? Check your spam folder or try resending.
          </p>
        </div>
      </div>
    </div>
  )
}