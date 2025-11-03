"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, Settings } from "lucide-react"

interface PayrollConfigBannerProps {
  onConfigure: () => void
}

export function PayrollConfigBanner({ onConfigure }: PayrollConfigBannerProps) {
  return (
    <Alert variant="destructive" className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
      <AlertCircle className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-900 dark:text-orange-100">Configuration Required</AlertTitle>
      <AlertDescription className="text-orange-800 dark:text-orange-200 mt-2">
        <p className="mb-3">
          Payroll system needs to be configured before use. Please select which forms contain your attendance and leave
          data.
        </p>
        <Button onClick={onConfigure} size="sm" className="bg-orange-600 hover:bg-orange-700">
          <Settings className="h-4 w-4 mr-2" />
          Configure Now
        </Button>
      </AlertDescription>
    </Alert>
  )
}
