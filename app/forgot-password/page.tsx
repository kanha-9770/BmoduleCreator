"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card, CardContent, CardDescription,
  CardHeader, CardTitle
} from '@/components/ui/card'
import {
  Form, FormControl, FormField,
  FormItem, FormLabel, FormMessage
} from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { Loader2, KeyRound, Mail, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

// ✅ Schema only for email
const EmailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type ForgotPasswordFormData = z.infer<typeof EmailSchema>

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(EmailSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()

      if (!response.ok) {
        toast({
          title: 'Error',
          description: result.error || 'Something went wrong',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Success!',
        description: 'Password reset code sent to your email',
      })
      router.push(`/reset-password?userId=${result.userId}`)
    } catch {
      toast({
        title: 'Error',
        description: 'Network error. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center bg-orange-600 rounded-full mb-4">
            <KeyRound className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Forgot Password
          </h1>
          <p className="mt-2 text-gray-600">
            Enter your email address to receive a password reset code
          </p>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Reset Password</CardTitle>
            <CardDescription>
              We'll send you a 6-digit code to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            {...field}
                            type="email"
                            placeholder="Enter your email address"
                            className="pl-10 h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                            disabled={isLoading}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-medium transition-all duration-200 hover:scale-[1.02]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sending reset code...</span>
                    </div>
                  ) : (
                    'Send Reset Code'
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center space-y-3">
              <Link
                href="/login"
                className="inline-flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-500"
              >
                <ArrowLeft className="h-3 w-3" />
                <span>Back to login</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
