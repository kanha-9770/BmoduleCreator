"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, AlertCircle, Loader2, Send, Eye, Star, Trash2, ImageIcon } from 'lucide-react';
import type { Form, FormField } from "@/types/form-builder";
import { LookupField } from "@/components/lookup-field";
import CameraCapture from "@/components/camera-capture";

interface PublicFormDialogProps {
  formId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface FormSection {
  id: string;
  title: string;
  fields: FormField[];
}

export function PublicFormDialog({ formId, isOpen, onClose }: PublicFormDialogProps) {
  const { toast } = useToast();
  const [form, setForm] = useState<Form | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    console.log("Dialog props changed:", { formId, isOpen });
    if (formId && isOpen) {
      console.log("Fetching form for ID:", formId);
      fetchForm();
      trackFormView();
    }
  }, [formId, isOpen]);

  useEffect(() => {
    console.log("Form or formData changed, recalculating completion");
    calculateCompletion();
  }, [formData, form]);

  useEffect(() => {
    console.log("Form data changed:", formData);
  }, [formData]);

  useEffect(() => {
    console.log("Dialog open state changed:", isOpen);
    if (!isOpen) {
      console.log("Resetting form state");
      setForm(null);
      setFormData({});
      setErrors({});
      setSubmitted(false);
      setCompletionPercentage(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (form) {
      console.log("Form loaded, checking for auto-fetch fields");
      autoFetchDateTimeFields();
    }
  }, [form]);

  const autoFetchDateTimeFields = async () => {
    try {
      const fieldsToAutoFetch = form?.sections.flatMap((section) =>
        section.fields.filter(
          (field) =>
            (field.type === "date" && field.properties?.autoFetchDate) ||
            (field.type === "time" && field.properties?.autoFetchTime) ||
            (field.type === "datetime" && (field.properties?.autoFetchDate || field.properties?.autoFetchTime))
        )
      );

      if (!fieldsToAutoFetch || fieldsToAutoFetch.length === 0) {
        console.log("No auto-fetch fields found");
        return;
      }

      console.log("Auto-fetching date/time for fields:", fieldsToAutoFetch.map((f) => f.id));

      const response = await fetch("/api/system-time");
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch system time");
      }

      const { date, time, datetime } = result.data;
      console.log("Fetched system time:", { date, time, datetime });

      const updates: Record<string, string> = {};
      fieldsToAutoFetch.forEach((field) => {
        if (field.type === "date" && field.properties?.autoFetchDate) {
          updates[field.id] = date;
          console.log(`Auto-filled date field ${field.id} with ${date}`);
        } else if (field.type === "time" && field.properties?.autoFetchTime) {
          updates[field.id] = time;
          console.log(`Auto-filled time field ${field.id} with ${time}`);
        } else if (field.type === "datetime" && (field.properties?.autoFetchDate || field.properties?.autoFetchTime)) {
          updates[field.id] = datetime;
          console.log(`Auto-filled datetime field ${field.id} with ${datetime}`);
        }
      });

      if (Object.keys(updates).length > 0) {
        setFormData((prev) => ({
          ...prev,
          ...updates,
        }));
        console.log("Form data updated with auto-fetched values");
      }
    } catch (error) {
      console.error("Error auto-fetching date/time:", error);
      toast({
        title: "Warning",
        description: "Could not auto-fetch date/time from system",
        variant: "destructive",
      });
    }
  };

  const fetchForm = async () => {
    if (!formId) {
      console.log("No formId provided, skipping fetch");
      return;
    }

    try {
      console.log("Starting form fetch");
      setLoading(true);
      const response = await fetch(`/api/forms/${formId}`);
      console.log("Form fetch response status:", response.status);
      const result = await response.json();
      console.log("Form fetch result:", result);
      if (!result.success) {
        throw new Error(result.error);
      }
      if (!result.data.isPublished) {
        throw new Error("This form is not published");
      }
      console.log("Setting form:", result.data);
      setForm(result.data);
      const initialData: Record<string, any> = {};
      result.data.sections.forEach((section: any) => {
        section.fields.forEach((field: FormField) => {
          if (field.defaultValue) {
            initialData[field.id] = field.defaultValue;
          }
        });
      });
      console.log("Initial form data:", initialData);
      setFormData(initialData);
    } catch (error: any) {
      console.error("Error in fetchForm:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      console.log("Form fetch completed, loading set to false");
      setLoading(false);
    }
  };

  const trackFormView = async () => {
    if (!formId) {
      console.log("No formId for tracking view");
      return;
    }

    try {
      console.log("Tracking form view event");
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
      });
      console.log("Form view tracked successfully");
    } catch (error) {
      console.error("Error tracking form view:", error);
    }
  };

  const calculateCompletion = () => {
    console.log("Calculating completion percentage");
    if (!form) {
      console.log("No form available for completion calculation");
      return;
    }
    const allFields = form.sections.flatMap((section) => section.fields);
    console.log("All fields:", allFields.length);
    const requiredFields = allFields.filter((field) => field.validation?.required);
    console.log("Required fields:", requiredFields.length);
    const completedRequired = requiredFields.filter((field) => {
      const value = formData[field.id];
      return value !== undefined && value !== null && value !== "";
    });
    console.log("Completed required fields:", completedRequired.length);
    const percentage =
      requiredFields.length > 0 ? Math.round((completedRequired.length / requiredFields.length) * 100) : 100;
    console.log("Completion percentage:", percentage);
    setCompletionPercentage(percentage);
  };

  const validateField = (field: FormField, value: any): string | null => {
    console.log(`Validating field ${field.id} with value:`, value);
    const validation = field.validation || {};
    if (validation.required && (!value || value === "")) {
      console.log(`Validation failed: ${field.label} is required`);
      return `${field.label} is required`;
    }
    if (field.type === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        console.log(`Validation failed: Invalid email for ${field.id}`);
        return "Please enter a valid email address";
      }
    }
    if (field.type === "url" && value) {
      try {
        new URL(value);
        console.log(`URL validation passed for ${field.id}`);
      } catch {
        console.log(`Validation failed: Invalid URL for ${field.id}`);
        return "Please enter a valid URL";
      }
    }
    if (field.type === "tel" && value) {
      const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(value.replace(/[\s\-()]/g, ""))) {
        console.log(`Validation failed: Invalid phone for ${field.id}`);
        return "Please enter a valid phone number";
      }
    }
    if (field.type === "number" && value) {
      const num = Number(value);
      if (isNaN(num)) {
        console.log(`Validation failed: Invalid number for ${field.id}`);
        return "Please enter a valid number";
      }
      if (validation.min !== undefined && num < validation.min) {
        console.log(`Validation failed: Number too low for ${field.id}`);
        return `Value must be at least ${validation.min}`;
      }
      if (validation.max !== undefined && num > validation.max) {
        console.log(`Validation failed: Number too high for ${field.id}`);
        return `Value must be at most ${validation.max}`;
      }
    }
    if ((field.type === "text" || field.type === "textarea") && value) {
      if (validation.minLength && value.length < validation.minLength) {
        console.log(`Validation failed: Text too short for ${field.id}`);
        return `Must be at least ${validation.minLength} characters`;
      }
      if (validation.maxLength && value.length > validation.maxLength) {
        console.log(`Validation failed: Text too long for ${field.id}`);
        return `Must be at most ${validation.maxLength} characters`;
      }
    }
    if (validation.pattern && value) {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(value)) {
        console.log(`Validation failed: Pattern mismatch for ${field.id}`);
        return validation.patternMessage || "Invalid format";
      }
    }
    if ((field.type === "image" || field.type === "signature") && validation.required && !value) {
      console.log(`Validation failed: ${field.label} is required`);
      return `${field.label} is required`;
    }
    if (field.type === "camera" && validation.required && !value) {
      console.log(`Validation failed: ${field.label} is required`);
      return `${field.label} is required`;
    }
    console.log(`Validation passed for field ${field.id}`);
    return null;
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    console.log(`Field ${fieldId} changed to:`, value);
    let storeValue = value;
    if (value && typeof value === "object") {
      if (Array.isArray(value)) {
        storeValue = value.map((item) => item.storeValue || item.label || item.value);
        console.log(`Handled array value for ${fieldId}:`, storeValue);
      } else if (value.storeValue !== undefined) {
        storeValue = value.storeValue;
        console.log(`Handled single selection for ${fieldId}:`, storeValue);
      } else if (value instanceof File) {
        console.log(`Processing file for ${fieldId}:`, value.name);
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          console.log(`File read success for ${fieldId}, data URL length:`, result.length);
          setFormData((prev) => {
            const newData = { ...prev, [fieldId]: result };
            console.log("Updated form data with file:", newData);
            return newData;
          });
          if (errors[fieldId]) {
            console.log(`Clearing error for ${fieldId}`);
            setErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors[fieldId];
              return newErrors;
            });
          }
        };
        reader.onerror = () => {
          console.error(`File read error for ${fieldId}`);
          toast({
            title: "Error",
            description: "Failed to read file",
            variant: "destructive",
          });
        };
        reader.readAsDataURL(value);
        return;
      }
    }
    console.log(`Setting form data for ${fieldId}:`, storeValue);
    setFormData((prev) => {
      const newData = { ...prev, [fieldId]: storeValue };
      console.log("Updated form data:", newData);
      return newData;
    });
    if (errors[fieldId]) {
      console.log(`Clearing error for ${fieldId}`);
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const handleClearFile = (fieldId: string) => {
    console.log(`Clearing file for field:`, fieldId);
    setFormData((prev) => {
      const newData = { ...prev, [fieldId]: "" };
      console.log("Cleared file for field:", fieldId, newData);
      return newData;
    });
    if (fileInputRefs.current[fieldId]) {
      console.log(`Resetting file input ref for ${fieldId}`);
      fileInputRefs.current[fieldId]!.value = "";
    }
    if (errors[fieldId]) {
      console.log(`Clearing error for ${fieldId} on clear`);
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    console.log("Starting form validation");
    if (!form) {
      console.log("No form for validation");
      return false;
    }
    const newErrors: Record<string, string> = {};
    let isValid = true;
    form.sections.forEach((section) => {
      console.log(`Validating section: ${section.title}`);
      section.fields.forEach((field) => {
        const error = validateField(field, formData[field.id]);
        if (error) {
          newErrors[field.id] = error;
          isValid = false;
          console.log(`Validation error for ${field.id}:`, error);
        }
      });
    });
    console.log("Setting new errors:", newErrors);
    setErrors(newErrors);
    console.log("Form validation result:", isValid);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("Form submission started");
    console.log("Current form data:", formData);
    e.preventDefault();
    if (!validateForm()) {
      console.log("Form validation failed");
      toast({
        title: "Validation Error",
        description: "Please fix the errors below",
        variant: "destructive",
      });
      return;
    }

    if (Object.keys(formData).length === 0) {
      console.log("No data in form");
      toast({
        title: "No Data",
        description: "Please fill out the form before submitting",
        variant: "destructive",
      });
      return;
    }

    console.log("Starting submission process");
    setSubmitting(true);
    try {
      console.log("Sending form submission with field IDs as keys...");
      const response = await fetch(`/api/forms/${formId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordData: formData,
          submittedBy: "anonymous",
          userAgent: navigator.userAgent,
        }),
      });
      console.log("Submission response status:", response.status);
      const result = await response.json();
      console.log("Submission response:", result);
      if (!result.success) {
        throw new Error(result.error);
      }
      console.log("Submission successful, setting submitted state");
      setSubmitted(true);
      toast({
        title: "Success!",
        description: form?.submissionMessage || "Form submitted successfully",
      });

      console.log("Tracking submit event");
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
      });
      console.log("Submit event tracked");
      console.log("Form submitted successfully with field labels:", result.data.recordData);
    } catch (error: any) {
      console.error("Submission error:", error);
      toast({
        title: "Submission Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      console.log("Submission process ended, resetting submitting state");
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.id];
    const error = errors[field.id];
    console.log(`Rendering field ${field.id} of type ${field.type}, value:`, value, `error:`, error);

    const isAutoFetched = field.properties?.autoFetchDate || field.properties?.autoFetchTime;
    const isReadOnly = field.readonly || isAutoFetched;

    const fieldProps = {
      id: field.id,
      disabled: submitting || submitted,
      className: error ? "border-red-500" : "",
    };

    const options = Array.isArray(field.options) ? field.options : [];
    console.log(`Field ${field.id} options:`, options);

    const lookupFieldData = {
      id: field.id,
      label: field.label,
      placeholder: field.placeholder || undefined,
      description: field.description || undefined,
      validation: field.validation || { required: false },
      lookup: field.lookup || undefined,
    };

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
        );
      case "password":
        return (
          <Input
            {...fieldProps}
            type="password"
            placeholder={field.placeholder || ""}
            value={value || ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        );
      case "textarea":
        return (
          <Textarea
            {...fieldProps}
            placeholder={field.placeholder || ""}
            value={value || ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            rows={3}
          />
        );
      case "date":
        return (
          <Input
            {...fieldProps}
            type="date"
            value={value || ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            readOnly={isReadOnly}
            className={`${fieldProps.className} ${isReadOnly ? 'bg-muted cursor-not-allowed' : ''}`}
          />
        );
      case "time":
        return (
          <Input
            {...fieldProps}
            type="time"
            value={value || ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            readOnly={isReadOnly}
            className={`${fieldProps.className} ${isReadOnly ? 'bg-muted cursor-not-allowed' : ''}`}
          />
        );
      case "datetime":
        return (
          <Input
            {...fieldProps}
            type="datetime-local"
            value={value || ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            readOnly={isReadOnly}
            className={`${fieldProps.className} ${isReadOnly ? 'bg-muted cursor-not-allowed' : ''}`}
          />
        );
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
        );
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
        );
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
        );
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
        );
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
        );
      case "rating":
        return (
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleFieldChange(field.id, rating)}
                disabled={submitting || submitted}
                className="p-1 hover:scale-110 transition-transform"
              >
                <Star
                  className={`h-4 w-4 ${rating <= (value || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                />
              </button>
            ))}
            <span className="pl-2 text-sm text-muted-foreground">{value ? `${value}/5` : "Not rated"}</span>
          </div>
        );
      case "lookup":
        return (
          <LookupField
            field={lookupFieldData}
            value={value}
            onChange={(val) => handleFieldChange(field.id, val)}
            disabled={submitting || submitted}
            error={error}
          />
        );
      case "file":
        return (
          <Input
            {...fieldProps}
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                console.log(`File selected for ${field.id}:`, file.name);
                handleFieldChange(field.id, file);
              }
            }}
            multiple={field.properties?.multiple || false}
          />
        );
      case "camera":
        return (
          <CameraCapture
            onCapture={(imageData) => handleFieldChange(field.id, imageData)}
            capturedImage={value || null}
            onClear={() => handleFieldChange(field.id, "")}
            disabled={submitting || submitted}
          />
        );
      case "image":
      case "signature":
        return (
          <div className="space-y-2">
            {value ? (
              <div className="relative">
                <img
                  src={value || "/placeholder.svg"}
                  alt={field.type === "image" ? "Uploaded image" : "Uploaded signature"}
                  className={`max-w-full h-auto rounded border ${error ? "border-red-500" : ""}`}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 bg-white/80 hover:bg-white"
                  onClick={() => handleClearFile(field.id)}
                  disabled={submitting || submitted}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Input
                  {...fieldProps}
                  type="file"
                  ref={(el) => (fileInputRefs.current[field.id] = el)}
                  accept={field.type === "image" ? "image/*" : "image/png,image/jpeg"}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      console.log(`File selected for ${field.id}:`, file.name);
                      handleFieldChange(field.id, file);
                    }
                  }}
                />
                <ImageIcon className="h-5 w-5 text-gray-500" />
              </div>
            )}
          </div>
        );
      case "hidden":
        return <Input {...fieldProps} type="hidden" value={value || field.defaultValue || ""} />;
      default:
        console.log(`Unknown field type ${field.type}, falling back to input`);
        return (
          <Input
            {...fieldProps}
            placeholder={field.placeholder || ""}
            value={value || ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        );
    }
  };

  console.log("Rendering dialog, submitted:", submitted, "loading:", loading, "form:", !!form);

  if (submitted) {
    console.log("Rendering submitted state");
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
                  console.log("Resetting for another submission");
                  setSubmitted(false);
                  setFormData({});
                  setErrors({});
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
    );
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
                    <div className="border-b pb-4">
                      <h3 className="text-lg font-semibold">{section.title}</h3>
                      {section.description && (
                        <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                      )}
                    </div>
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
  );
}
