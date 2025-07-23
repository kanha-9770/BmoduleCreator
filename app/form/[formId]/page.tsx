
"use client";
import type React from "react";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Send,
  Eye,
  Calendar,
  Star,
} from "lucide-react";
import type { Form, FormField } from "@/types/form-builder";
import { LookupField } from "@/components/lookup-field";

// Interface for the field entries in fullOption.data
interface LookupFieldData {
  field_id: string;
  field_value: string;
  field_label: string;
  field_type: string;
  field_section_id: string | null;
  [key: string]: any;
}

export default function PublicFormPage() {
  const params = useParams();
  const { toast } = useToast();
  const formId = params.formId as string;
  const [form, setForm] = useState<Form | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  useEffect(() => {
    if (formId) {
      fetchForm();
      trackFormView();
    }
  }, [formId]);

  useEffect(() => {
    calculateCompletion();
  }, [formData, form]);

  useEffect(() => {
    console.log("Form data changed:", formData);
  }, [formData]);

  const fetchForm = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/forms/${formId}`);
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error);
      }
      if (!result.data.isPublished) {
        throw new Error("This form is not published");
      }
      setForm(result.data);
      const initialData: Record<string, any> = {};
      result.data.sections.forEach((section: any) => {
        section.fields.forEach((field: FormField) => {
          if (field.defaultValue) {
            initialData[field.id] = field.defaultValue;
          }
        });
      });
      setFormData(initialData);
      console.log("Initial form data:", initialData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const trackFormView = async () => {
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
      });
    } catch (error) {
      console.error("Error tracking form view:", error);
    }
  };

  const calculateCompletion = () => {
    if (!form) return;
    const allFields = form.sections.flatMap((section) => section.fields);
    const requiredFields = allFields.filter(
      (field) => field.validation?.required
    );
    const completedRequired = requiredFields.filter((field) => {
      const value = formData[field.id];
      return value !== undefined && value !== null && value !== "";
    });
    const percentage =
      requiredFields.length > 0
        ? Math.round((completedRequired.length / requiredFields.length) * 100)
        : 100;
    setCompletionPercentage(percentage);
  };

  const validateField = (field: FormField, value: any): string | null => {
    const validation = field.validation || {};
    if (validation.required && (!value || value === "")) {
      return `${field.label} is required`;
    }
    if (field.type === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return "Please enter a valid email address";
      }
    }
    if (field.type === "url" && value) {
      try {
        new URL(value);
      } catch {
        return "Please enter a valid URL";
      }
    }
    if (field.type === "tel" && value) {
      const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(value.replace(/[\s\-()]/g, ""))) {
        return "Please enter a valid phone number";
      }
    }
    if (field.type === "number" && value) {
      const num = Number(value);
      if (isNaN(num)) {
        return "Please enter a valid number";
      }
      if (validation.min !== undefined && num < validation.min) {
        return `Value must be at least ${validation.min}`;
      }
      if (validation.max !== undefined && num > validation.max) {
        return `Value must be at most ${validation.max}`;
      }
    }
    if ((field.type === "text" || field.type === "textarea") && value) {
      if (validation.minLength && value.length < validation.minLength) {
        return `Must be at least ${validation.minLength} characters`;
      }
      if (validation.maxLength && value.length > validation.maxLength) {
        return `Must be at most ${validation.maxLength} characters`;
      }
    }
    if (validation.pattern && value) {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(value)) {
        return validation.patternMessage || "Invalid format";
      }
    }
    return null;
  };

  const handleFieldChange = (fieldId: string, value: any, fullOption?: any) => {
    console.log(
      `Field ${fieldId} changed to:`,
      value,
      "Full option:",
      fullOption
    );
    let storeValue = value;
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      value.storeValue !== undefined
    ) {
      storeValue = value.storeValue;
    }

    setFormData((prev) => {
      const newData = { ...prev, [fieldId]: storeValue };

      // If this is a lookup field and fullOption is provided, update related lookup fields
      if (
        form &&
        fullOption &&
        typeof fullOption === "object" &&
        fullOption.data?.record_id &&
        fullOption.data?.form_id
      ) {
        const currentField = form.sections
          .flatMap((section) => section.fields)
          .find((field) => field.id === fieldId && field.type === "lookup");

        if (currentField?.lookup) {
          // Find all related lookup fields with the same source, excluding the current field
          const relatedFields = form.sections
            .flatMap((section) => section.fields)
            .filter(
              (field) =>
                field.id !== fieldId &&
                field.type === "lookup" &&
                field.lookup?.sourceId === currentField.lookup?.sourceId
            );

          relatedFields.forEach((relatedField) => {

            // Find the matching field in fullOption.data by label
            const matchedField = Object.values(fullOption.data).find((field) => {
              const f = field as LookupFieldData;
              return (
                typeof f.field_label === "string" &&
                f.field_label.toLowerCase() === relatedField.label.toLowerCase() &&
                f.field_value
              );
            }) as LookupFieldData | undefined;

            if (matchedField) {
              newData[relatedField.id] = matchedField.field_value;
              console.log(
                `Auto-filled ${relatedField.label} with:`,
                matchedField.field_value
              );
            } else {
              console.log(
                `No matching field found in fullOption.data for label: ${relatedField.label}, form_id: ${fullOption.data.form_id}, record_id: ${fullOption.data.record_id}`
              );
            }
          });
        }
      }

      console.log("Updated form data:", newData);
      return newData;
    });

    // Clear error for this field
    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    if (!form) return false;
    const newErrors: Record<string, string> = {};
    let isValid = true;
    form.sections.forEach((section) => {
      section.fields.forEach((field) => {
        const error = validateField(field, formData[field.id]);
        if (error) {
          newErrors[field.id] = error;
          isValid = false;
        }
      });
    });
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submission started");
    console.log("Current form data:", formData);
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below",
        variant: "destructive",
      });
      return;
    }

    if (Object.keys(formData).length === 0) {
      toast({
        title: "No Data",
        description: "Please fill out the form before submitting",
        variant: "destructive",
      });
      return;
    }

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
      const result = await response.json();
      console.log("Submission response:", result);
      if (!result.success) {
        throw new Error(result.error);
      }
      setSubmitted(true);
      toast({
        title: "Success!",
        description: form?.submissionMessage || "Form submitted successfully",
      });

      await fetch(`/api/forms/${formId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "submit",
          payload: {
            recordId: result.data.id,
            timestamp: new Date().toISOString(),
            fieldLabels:
              result.data.form?.sections.flatMap((s: any) =>
                s.fields.map((f: any) => f.label)
              ) || [],
          },
        }),
      });
      console.log(
        "Form submitted successfully with field labels:",
        result.data.recordData
      );
    } catch (error: any) {
      console.error("Submission error:", error);
      toast({
        title: "Submission Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.id];
    const error = errors[field.id];
    const fieldProps = {
      id: field.id,
      disabled: submitting || submitted,
      className: error ? "border-red-500" : "",
    };

    const options = Array.isArray(field.options) ? field.options : [];

    const lookupFieldData = {
      id: field.id,
      label: field.label,
      type: field.type,
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
          />
        );
      case "datetime":
        return (
          <Input
            {...fieldProps}
            type="datetime-local"
            value={value || ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        );
      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={value || false}
              onCheckedChange={(checked) =>
                handleFieldChange(field.id, checked)
              }
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
              onCheckedChange={(checked) =>
                handleFieldChange(field.id, checked)
              }
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
                <RadioGroupItem
                  value={option.value}
                  id={`${field.id}-${option.value}`}
                />
                <Label
                  htmlFor={`${field.id}-${option.value}`}
                  className="text-sm"
                >
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
              <SelectValue
                placeholder={field.placeholder || "Select an option"}
              />
            </SelectTrigger>
            <SelectContent>
              {options.map((option: any) => (
                <SelectItem
                  key={option.value || option.id}
                  value={option.value || option.id}
                >
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
            <div className="text-center text-sm text-muted-foreground">
              Value: {value || 0}
            </div>
          </div>
        );
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
                  className={`h-6 w-6 ${rating <= (value || 0)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                    }`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-muted-foreground">
              {value ? `${value}/5` : "Not rated"}
            </span>
          </div>
        );
      case "lookup":
        return (
          <LookupField
            field={lookupFieldData}
            value={value}
            onChange={(val, fullOption) =>
              handleFieldChange(field.id, val, fullOption)
            }
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
                handleFieldChange(field.id, file.name);
              }
            }}
            multiple={field.properties?.multiple || false}
          />
        );
      case "hidden":
        return (
          <Input
            {...fieldProps}
            type="hidden"
            value={value || field.defaultValue || ""}
          />
        );
      default:
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Form Not Found</h2>
              <p className="text-muted-foreground">
                This form may have been removed or is not published.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Thank You!</h2>
              <p className="text-muted-foreground mb-4">
                {form.submissionMessage ||
                  "Your form has been submitted successfully."}
              </p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Submit Another Response
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{form.name}</CardTitle>
                {form.description && (
                  <CardDescription className="mt-2">
                    {form.description}
                  </CardDescription>
                )}
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
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-8">
              {form.sections.map((section) => (
                <div key={section.id} className="space-y-6">
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold">{section.title}</h3>
                    {section.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {section.description}
                      </p>
                    )}
                  </div>
                  <div
                    className={`grid gap-6 ${section.columns > 1
                        ? `md:grid-cols-${section.columns}`
                        : ""
                      }`}
                  >
                    {section.fields.map((field) => (
                      <div key={field.id} className="space-y-2">
                        {field.type !== "checkbox" &&
                          field.type !== "switch" &&
                          field.type !== "hidden" && (
                            <Label
                              htmlFor={field.id}
                              className="text-sm font-medium"
                            >
                              {field.label}
                              {field.validation?.required && (
                                <span className="text-red-500 ml-1">*</span>
                              )}
                            </Label>
                          )}
                        {field.description && field.type !== "hidden" && (
                          <p className="text-xs text-muted-foreground">
                            {field.description}
                          </p>
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
              <div className="pt-6 border-t">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={submitting}
                  size="lg"
                >
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
            </CardContent>
          </form>
        </Card>
        {process.env.NODE_ENV === "development" && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">
                Debug: Form Data (Field IDs as Keys)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(formData, null, 2)}
              </pre>
              <div className="mt-2">
                <strong>Field ID to Label Mapping:</strong>
                <pre className="text-xs bg-blue-50 p-2 rounded overflow-auto mt-1">
                  {form &&
                    JSON.stringify(
                      form.sections.flatMap((s) =>
                        s.fields.map((f) => ({ id: f.id, label: f.label }))
                      ),
                      null,
                      2
                    )}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}
        <div className="mt-4 text-center text-xs text-muted-foreground">
          <p className="flex items-center justify-center gap-1">
            <Calendar className="h-3 w-3" />
            Form created with Advanced Form Builder
          </p>
        </div>
      </div>
    </div>
  );
}