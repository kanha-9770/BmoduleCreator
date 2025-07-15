"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, AlertCircle, Loader2, Send, Eye, Star } from "lucide-react"
import type { Form, FormField } from "@/types/form-builder"
import { LookupField } from "@/components/lookup-field"

interface PublicFormDialogProps {
  formId: string | null
  isOpen: boolean
  onClose: () => void
}

interface FormSection {
  id: string
  title: string
  fields: FormField[]
}

export function PublicFormDialog({ formId, isOpen, onClose }: PublicFormDialogProps) {
  const { toast } = useToast()
  const [form, setForm] = useState<Form | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [completionPercentage, setCompletionPercentage] = useState(0)

  useEffect(() => {
    if (formId && isOpen) {
      fetchForm()
      trackFormView()
    }
  }, [formId, isOpen])

  useEffect(() => {
    calculateCompletion()
  }, [formData, form])

  useEffect(() => {
    console.log("Form data changed:", formData)
  }, [formData])

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setForm(null)
      setFormData({})
      setErrors({})
      setSubmitted(false)
      setCompletionPercentage(0)
    }
  }, [isOpen])

  const fetchForm = async () => {
    if (!formId) return

    try {
      setLoading(true)
      const response = await fetch(`/api/forms/${formId}`)
      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error)
      }
      if (!result.data.isPublished) {
        throw new Error("This form is not published")
      }
      setForm(result.data)
      // Initialize form data with default values using field IDs as keys
      const initialData: Record<string, any> = {}
      result.data.sections.forEach((section: any) => {
        section.fields.forEach((field: FormField) => {
          if (field.defaultValue) {
            initialData[field.id] = field.defaultValue
          }
        })
      })
      setFormData(initialData)
      console.log("Initial form data:", initialData)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const trackFormView = async () => {
    if (!formId) return

    try {
      await fetch(`/api/forms/${formId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "view",
          payload: {
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
          },
        }),
      })
    } catch (error) {
      console.error("Error tracking form view:", error)
    }
  }

  const calculateCompletion = () => {
    if (!form) return
    const allFields = form.sections.flatMap((section) => section.fields)
    const requiredFields = allFields.filter((field) => field.validation?.required)
    const completedRequired = requiredFields.filter((field) => {
      const value = formData[field.id]
      return value !== undefined && value !== null && value !== ""
    })
    const percentage =
      requiredFields.length > 0 ? Math.round((completedRequired.length / requiredFields.length) * 100) : 100
    setCompletionPercentage(percentage)
  }

  const validateField = (field: FormField, value: any): string | null => {
    const validation = field.validation || {}
    // Required validation
    if (validation.required && (!value || value === "")) {
      return `${field.label} is required`
    }
    // Email validation
    if (field.type === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        return "Please enter a valid email address"
      }
    }
    // URL validation
    if (field.type === "url" && value) {
      try {
        new URL(value)
      } catch {
        return "Please enter a valid URL"
      }
    }
    // Phone validation
    if (field.type === "tel" && value) {
      const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
      if (!phoneRegex.test(value.replace(/[\s\-()]/g, ""))) {
        return "Please enter a valid phone number"
      }
    }
    // Number validation
    if (field.type === "number" && value) {
      const num = Number(value)
      if (isNaN(num)) {
        return "Please enter a valid number"
      }
      if (validation.min !== undefined && num < validation.min) {
        return `Value must be at least ${validation.min}`
      }
      if (validation.max !== undefined && num > validation.max) {
        return `Value must be at most ${validation.max}`
      }
    }
    // Text length validation
    if ((field.type === "text" || field.type === "textarea") && value) {
      if (validation.minLength && value.length < validation.minLength) {
        return `Must be at least ${validation.minLength} characters`
      }
      if (validation.maxLength && value.length > validation.maxLength) {
        return `Must be at most ${validation.maxLength} characters`
      }
    }
    // Pattern validation
    if (validation.pattern && value) {
      const regex = new RegExp(validation.pattern)
      if (!regex.test(value)) {
        return validation.patternMessage || "Invalid format"
      }
    }
    return null
  }

  const handleFieldChange = (fieldId: string, value: any) => {
    console.log(`Field ${fieldId} changed to:`, value)
    // For lookup fields, store the actual value we want to save
    let storeValue = value
    if (value && typeof value === "object") {
      if (Array.isArray(value)) {
        // Multiple selection - extract store values
        storeValue = value.map((item) => item.storeValue || item.label || item.value)
      } else if (value.storeValue !== undefined) {
        // Single selection - use store value
        storeValue = value.storeValue
      }
    }
    setFormData((prev) => {
      const newData = { ...prev, [fieldId]: storeValue }
      console.log("Updated form data:", newData)
      return newData
    })
    // Clear error for this field
    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[fieldId]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    if (!form) return false
    const newErrors: Record<string, string> = {}
    let isValid = true
    form.sections.forEach((section) => {
      section.fields.forEach((field) => {
        const error = validateField(field, formData[field.id])
        if (error) {
          newErrors[field.id] = error
          isValid = false
        }
      })
    })
    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submission started")
    console.log("Current form data:", formData)
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below",
        variant: "destructive",
      })
      return
    }

    // Check if form data is empty
    if (Object.keys(formData).length === 0) {
      toast({
        title: "No Data",
        description: "Please fill out the form before submitting",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      console.log("Sending form submission with field IDs as keys...")
      const response = await fetch(`/api/forms/${formId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordData: formData, // This contains field IDs as keys
          submittedBy: "anonymous",
          userAgent: navigator.userAgent,
        }),
      })
      const result = await response.json()
      console.log("Submission response:", result)
      if (!result.success) {
        throw new Error(result.error)
      }
      setSubmitted(true)
      toast({
        title: "Success!",
        description: form?.submissionMessage || "Form submitted successfully",
      })

      // Track submission
      await fetch(`/api/forms/${formId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "submit",
          payload: {
            recordId: result.data.id,
            timestamp: new Date().toISOString(),
            fieldLabels: result.data.form?.sections.flatMap((s: any) => s.fields.map((f: any) => f.label)) || [],
          },
        }),
      })
      console.log("Form submitted successfully with field labels:", result.data.recordData)
    } catch (error: any) {
      console.error("Submission error:", error)
      toast({
        title: "Submission Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const renderField = (field: FormField) => {
    const value = formData[field.id]
    const error = errors[field.id]
    const fieldProps = {
      id: field.id,
      disabled: submitting || submitted,
      className: error ? "border-red-500" : "",
    }

    // Ensure options is an array for select and radio fields
    const options = Array.isArray(field.options) ? field.options : []

    // Convert field to match LookupField interface
    const lookupFieldData = {
      id: field.id,
      label: field.label,
      placeholder: field.placeholder || undefined,
      description: field.description || undefined,
      validation: field.validation || { required: false },
      lookup: field.lookup || undefined,
    }

    switch (field.type) {
      case "text":
      case "email":
      case "number":
      case "tel":
      case "url":
        return (
          <Input
            {...fieldProps}
            type={field.type}
            placeholder={field.placeholder || ""}
            value={value || ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        )
      case "password":
        return (
          <Input
            {...fieldProps}
            type="password"
            placeholder={field.placeholder || ""}
            value={value || ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        )
      case "textarea":
        return (
          <Textarea
            {...fieldProps}
            placeholder={field.placeholder || ""}
            value={value || ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            rows={3}
          />
        )
      case "date":
        return (
          <Input
            {...fieldProps}
            type="date"
            value={value || ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        )
      case "datetime":
        return (
          <Input
            {...fieldProps}
            type="datetime-local"
            value={value || ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        )
      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={value || false}
              onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
              disabled={submitting || submitted}
            />
            <Label htmlFor={field.id} className="text-sm">
              {field.label}
            </Label>
          </div>
        )
      case "switch":
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={field.id}
              checked={value || false}
              onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
              disabled={submitting || submitted}
            />
            <Label htmlFor={field.id} className="text-sm">
              {field.label}
            </Label>
          </div>
        )
      case "radio":
        return (
          <RadioGroup
            value={value || ""}
            onValueChange={(val) => handleFieldChange(field.id, val)}
            disabled={submitting || submitted}
          >
            {options.map((option: any) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${field.id}-${option.value}`} />
                <Label htmlFor={`${field.id}-${option.value}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )
      case "select":
        return (
          <Select
            value={value || ""}
            onValueChange={(val) => handleFieldChange(field.id, val)}
            disabled={submitting || submitted}
          >
            <SelectTrigger className={error ? "border-red-500" : ""}>
              <SelectValue placeholder={field.placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option: any) => (
                <SelectItem key={option.value || option.id} value={option.value || option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case "slider":
        return (
          <div className="space-y-2">
            <Slider
              value={[value || 0]}
              onValueChange={(vals) => handleFieldChange(field.id, vals[0])}
              max={field.validation?.max || 100}
              min={field.validation?.min || 0}
              step={1}
              disabled={submitting || submitted}
              className="w-full"
            />
            <div className="text-center text-sm text-muted-foreground">Value: {value || 0}</div>
          </div>
        )
      case "rating":
        return (
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleFieldChange(field.id, rating)}
                disabled={submitting || submitted}
                className="p-1 hover:scale-110 transition-transform"
              >
                <Star
                  className={`h-6 w-6 ${rating <= (value || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-muted-foreground">{value ? `${value}/5` : "Not rated"}</span>
          </div>
        )
      case "lookup":
        return (
          <LookupField
            field={lookupFieldData}
            value={value}
            onChange={(val) => handleFieldChange(field.id, val)}
            disabled={submitting || submitted}
            error={error}
          />
        )
      case "file":
        return (
          <Input
            {...fieldProps}
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                handleFieldChange(field.id, file.name)
              }
            }}
            multiple={field.properties?.multiple || false}
          />
        )
      case "hidden":
        return <Input {...fieldProps} type="hidden" value={value || field.defaultValue || ""} />
      default:
        return (
          <Input
            {...fieldProps}
            placeholder={field.placeholder || ""}
            value={value || ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        )
    }
  }

  if (submitted) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Thank You!</h2>
            <p className="text-muted-foreground mb-4">
              {form?.submissionMessage || "Your form has been submitted successfully."}
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => {
                  setSubmitted(false)
                  setFormData({})
                  setErrors({})
                }}
                variant="outline"
              >
                Submit Another Response
              </Button>
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="py-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="space-y-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : !form ? (
          <div className="py-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Form Not Found</h2>
              <p className="text-muted-foreground">This form may have been removed or is not published.</p>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-2xl">{form.name}</DialogTitle>
                  {form.description && <p className="text-muted-foreground mt-2">{form.description}</p>}
                </div>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  Public
                </Badge>
              </div>
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Progress</span>
                  <span>{completionPercentage}% complete</span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
              </div>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-8 py-4">
                {form.sections.map((section) => (
                  <div key={section.id} className="space-y-6">
                    {/* Section Header */}
                    <div className="border-b pb-4">
                      <h3 className="text-lg font-semibold">{section.title}</h3>
                      {section.description && (
                        <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                      )}
                    </div>
                    {/* Section Fields */}
                    <div className={`grid gap-6 ${section.columns > 1 ? `md:grid-cols-${section.columns}` : ""}`}>
                      {section.fields.map((field) => (
                        <div key={field.id} className="space-y-2">
                          {field.type !== "checkbox" && field.type !== "switch" && field.type !== "hidden" && (
                            <Label htmlFor={field.id} className="text-sm font-medium">
                              {field.label}
                              {field.validation?.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                          )}
                          {field.description && field.type !== "hidden" && (
                            <p className="text-xs text-muted-foreground">{field.description}</p>
                          )}
                          {renderField(field)}
                          {errors[field.id] && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors[field.id]}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {/* Submit Button */}
                <div className="pt-6 border-t flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Form
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
