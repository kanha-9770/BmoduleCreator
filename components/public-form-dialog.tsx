"use client";

import type React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
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
import { CheckCircle, AlertCircle, Loader2, Send, Eye, Star, Trash2, ImageIcon, MapPin } from 'lucide-react';
import type { Form, FormField } from "@/types/form-builder";
import { LookupField } from "@/components/lookup-field";
import CameraCapture from "@/components/camera-capture";
import { recordCheckIn, recordCheckOut } from "@/lib/attendance";
import { FileUploadZone } from "./file-upload-zone";

interface LocationResult {
  address: string;
  lat: number;
  lng: number;
}

const fetchUserLocation = async (retry = false): Promise<LocationResult | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported");
      return resolve(null);
    }

    const handleSuccess = async (pos: GeolocationPosition) => {
      const { latitude, longitude } = pos.coords;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
        );
        const data = await res.json();
        const address = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        resolve({ address, lat: latitude, lng: longitude });
      } catch {
        resolve(null);
      }
    };

    const handleError = (err: GeolocationPositionError) => {
      console.warn("Geolocation error:", err.message);
      if (!retry && err.code === 1) {
        setTimeout(() => {
          navigator.geolocation.getCurrentPosition(handleSuccess, () => resolve(null), {
            enableHighAccuracy: true,
            timeout: 10000,
          });
        }, 500);
      } else {
        resolve(null);
      }
    };

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }
    );
  });
};

interface PublicFormDialogProps {
  formId: string | null;
  isOpen: boolean;
  onClose: () => void;
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
  const [locationStatus, setLocationStatus] = useState<Record<string, "idle" | "fetching" | "success" | "failed">>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const hasUserInteracted = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      setForm(null);
      setFormData({});
      setErrors({});
      setSubmitted(false);
      setCompletionPercentage(0);
      setLocationStatus({});
      hasUserInteracted.current = false;
    }
  }, [isOpen]);

  useEffect(() => {
    if (formId && isOpen) {
      fetchForm();
      trackFormView();
    }
  }, [formId, isOpen]);

  useEffect(() => {
    calculateCompletion();
  }, [formData, form]);

  const triggerLocationFetch = useCallback(async () => {
    if (!form) return;

    const locationFields = form.sections.flatMap((s) =>
      s.fields.filter((f) => {
        const type = (f.type || "").toString().toLowerCase();
        return (type === "location" || type === "newlocation") && f.properties?.autoFetchLocation;
      })
    );

    if (locationFields.length === 0) return;

    const updates: Record<string, any> = {};
    let anySuccess = false;

    for (const field of locationFields) {
      const fieldId = field.id;
      if (formData[fieldId]) continue;

      setLocationStatus((prev) => ({ ...prev, [fieldId]: "fetching" }));

      const loc = await fetchUserLocation(true);
      if (loc) {
        updates[fieldId] = loc.address;
        const coordId = `${fieldId}_coords`;
        const hasCoord = form.sections
          .flatMap((s) => s.fields)
          .some((f) => f.id === coordId && f.type === "hidden");
        if (hasCoord) updates[coordId] = `${loc.lat},${loc.lng}`;
        setLocationStatus((prev) => ({ ...prev, [fieldId]: "success" }));
        anySuccess = true;
      } else {
        setLocationStatus((prev) => ({ ...prev, [fieldId]: "failed" }));
      }
    }

    if (Object.keys(updates).length > 0) {
      setFormData((prev) => ({ ...prev, ...updates }));
    }

    if (!anySuccess && locationFields.length > 0) {
      toast({
        title: "Location",
        description: "Could not auto-fetch location. Please type it manually.",
        variant: "default",
      });
    }
  }, [form, formData, toast]);

  useEffect(() => {
    if (!hasUserInteracted.current && isOpen && form) {
      const handler = () => {
        hasUserInteracted.current = true;
        triggerLocationFetch();
        document.removeEventListener("click", handler);
        document.removeEventListener("keydown", handler);
      };
      document.addEventListener("click", handler);
      document.addEventListener("keydown", handler);
      return () => {
        document.removeEventListener("click", handler);
        document.removeEventListener("keydown", handler);
      };
    }
  }, [isOpen, form, triggerLocationFetch]);

  useEffect(() => {
    if (hasUserInteracted.current && form) {
      triggerLocationFetch();
    }
  }, [form, triggerLocationFetch]);

  useEffect(() => {
    if (!form) return;
    const dateTimeFields = form.sections.flatMap((s) =>
      s.fields.filter(
        (f) =>
          (f.type === "date" && f.properties?.autoFetchDate) ||
          (f.type === "time" && f.properties?.autoFetchTime) ||
          (f.type === "datetime" && (f.properties?.autoFetchDate || f.properties?.autoFetchTime))
      )
    );

    if (dateTimeFields.length === 0) return;

    fetch("/api/system-time")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          const { date, time, datetime } = json.data;
          const updates: Record<string, any> = {};
          dateTimeFields.forEach((f) => {
            if (f.type === "date" && f.properties?.autoFetchDate) updates[f.id] = date;
            else if (f.type === "time" && f.properties?.autoFetchTime) updates[f.id] = time;
            else if (f.type === "datetime") updates[f.id] = datetime;
          });
          setFormData((prev) => ({ ...prev, ...updates }));
        }
      })
      .catch(() => { });
  }, [form]);

  const fetchForm = async () => {
    if (!formId) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/forms/${formId}`);
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      if (!result.data.isPublished) throw new Error("This form is not published");
      setForm(result.data);

      const initialData: Record<string, any> = {};
      result.data.sections.forEach((section: any) => {
        section.fields.forEach((field: FormField) => {
          if (field.defaultValue) initialData[field.id] = field.defaultValue;
        });
      });
      setFormData(initialData);
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
    if (!formId) return;
    try {
      await fetch(`/api/forms/${formId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "view",
          payload: { userAgent: navigator.userAgent, timestamp: new Date().toISOString() },
        }),
      });
    } catch (error) {
      console.error("Track view failed", error);
    }
  };

  const calculateCompletion = () => {
    if (!form) return;
    const allFields = form.sections.flatMap((s) => s.fields);
    const required = allFields.filter((f) => f.validation?.required);
    const filled = required.filter((f) => {
      const v = formData[f.id];
      return v !== undefined && v !== null && v !== "";
    });
    const percentage = required.length > 0 ? Math.round((filled.length / required.length) * 100) : 100;
    setCompletionPercentage(percentage);
  };

  const validateField = (field: FormField, value: any): string | null => {
    const v = field.validation || {};
    if (v.required && (!value || value === "")) return `${field.label} is required`;

    if (field.type === "email" && value) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(value)) return "Please enter a valid email address";
    }

    if (field.type === "url" && value) {
      try { new URL(value); } catch { return "Please enter a valid URL"; }
    }

    if (field.type === "tel" && value) {
      const cleaned = value.replace(/[\s\-()]/g, "");
      const re = /^[+]?[1-9][\d]{0,15}$/;
      if (!re.test(cleaned)) return "Please enter a valid phone number";
    }

    if (field.type === "number" && value) {
      const num = Number(value);
      if (isNaN(num)) return "Please enter a valid number";
      if (v.min !== undefined && num < v.min) return `Value must be at least ${v.min}`;
      if (v.max !== undefined && num > v.max) return `Value must be at most ${v.max}`;
    }

    if ((field.type === "text" || field.type === "textarea") && value) {
      if (v.minLength && value.length < v.minLength) return `Must be at least ${v.minLength} characters`;
      if (v.maxLength && value.length > v.maxLength) return `Must be at most ${v.maxLength} characters`;
    }

    if (v.pattern && value) {
      const re = new RegExp(v.pattern);
      if (!re.test(value)) return v.patternMessage || "Invalid format";
    }

    return null;
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    let storeValue = value;

    if (value && typeof value === "object") {
      if (Array.isArray(value)) {
        storeValue = value.map((i) => i.storeValue || i.label || i.value);
      } else if (value.storeValue !== undefined) {
        storeValue = value.storeValue;
      } else if (value instanceof File) {
        const reader = new FileReader();
        reader.onload = () => {
          setFormData((prev) => ({ ...prev, [fieldId]: reader.result as string }));
          setErrors((prev) => {
            const e = { ...prev };
            delete e[fieldId];
            return e;
          });
        };
        reader.onerror = () => {
          toast({ title: "Error", description: "Failed to read file", variant: "destructive" });
        };
        reader.readAsDataURL(value);
        return;
      }
    }

    setFormData((prev) => ({ ...prev, [fieldId]: storeValue }));
    setErrors((prev) => {
      const e = { ...prev };
      delete e[fieldId];
      return e;
    });
  };

  const handleClearFile = (fieldId: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: "" }));
    if (fileInputRefs.current[fieldId]) fileInputRefs.current[fieldId]!.value = "";
    setErrors((prev) => {
      const e = { ...prev };
      delete e[fieldId];
      return e;
    });
  };

  const validateForm = (): boolean => {
    if (!form) return false;
    const newErrors: Record<string, string> = {};
    let valid = true;

    form.sections.forEach((section) => {
      section.fields.forEach((field) => {
        const err = validateField(field, formData[field.id]);
        if (err) {
          newErrors[field.id] = err;
          valid = false;
        }
      });
    });

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({ title: "Validation Error", description: "Please fix the errors", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const userId = (window as any).__currentUserId;
      
      if (!userId) {
        toast({ title: "Error", description: "User not authenticated", variant: "destructive" });
        setSubmitting(false);
        return;
      }

      const formNameLower = form?.name.toLowerCase() || "";

      if (formNameLower === "check-in") {
        console.log("[v0] Recording check-in for user:", userId)
        const response = await fetch("/api/attendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userId,
            action: "checkin",
          }),
        });

        const data = await response.json();
        console.log("[v0] Check-in response:", data)
        if (!data.success) {
          toast({ title: "Error", description: data.error || "Check-In failed", variant: "destructive" });
          setSubmitting(false);
          return;
        }
      } else if (formNameLower === "check-out") {
        console.log("[v0] Recording check-out for user:", userId)
        const response = await fetch("/api/attendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userId,
            action: "checkout",
          }),
        });

        const data = await response.json();
        console.log("[v0] Check-out response:", data)
        if (!data.success) {
          toast({ title: "Error", description: data.error || "Check-Out failed", variant: "destructive" });
          setSubmitting(false);
          return;
        }
      }

      const res = await fetch(`/api/forms/${formId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordData: formData,
          submittedBy: "anonymous",
          userAgent: navigator.userAgent,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      setSubmitted(true);
      toast({ title: "Success!", description: form?.submissionMessage || "Form submitted!" });

      await fetch(`/api/forms/${formId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "submit",
          payload: { recordId: json.data.id, timestamp: new Date().toISOString() },
        }),
      });

      if ((window as any).__handleFormSubmitted) {
        console.log("[v0] Calling form submitted callback for:", form?.name)
        await (window as any).__handleFormSubmitted(form?.name || "");
      }

      // Auto-close after brief delay for smooth UX
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error("[v0] Submit error:", error)
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.id];
    const error = errors[field.id];
    const fieldType = (field.type || "").toString().toLowerCase();
    const isLocation = fieldType === "location" || fieldType === "newlocation";
    const autoFetch = isLocation && field.properties?.autoFetchLocation;
    const status = locationStatus[field.id] || "idle";

    const isReadOnly = field.readonly || (autoFetch && status === "success");

    const fieldProps = {
      id: field.id,
      disabled: submitting || submitted,
      className: error ? "border-red-500" : "",
    };

    const options = Array.isArray(field.options) ? field.options : [];

    switch (fieldType) {
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
            readOnly={field.readonly || field.properties?.autoFetchDate}
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
            readOnly={field.readonly || field.properties?.autoFetchTime}
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

      case "location":
      case "newlocation":
        let placeholder = field.placeholder || "Enter location";
        let icon: React.ReactNode = null;

        if (autoFetch) {
          if (status === "fetching") {
            placeholder = "Fetching your location…";
            icon = <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
          } else if (status === "failed") {
            placeholder = "Location denied – type manually";
            icon = <MapPin className="h-4 w-4 text-amber-600" />;
          } else if (status === "success") {
            placeholder = "Location auto-filled";
            icon = <MapPin className="h-4 w-4 text-green-600" />;
          } else if (status === "idle") {
            placeholder = "Click anywhere to allow location";
            icon = <MapPin className="h-4 w-4 text-muted-foreground" />;
          }
        }

        return (
          <div className="space-y-1">
            <div className="relative">
              <Input
                {...fieldProps}
                type="text"
                placeholder={placeholder}
                value={value || ""}
                readOnly={isReadOnly}
                className={`${fieldProps.className} ${isReadOnly ? 'bg-muted cursor-not-allowed' : ''} pl-10`}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
              />
              {icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  {icon}
                </div>
              )}
            </div>
            {autoFetch && status === "failed" && (
              <p className="text-xs text-amber-600">
                Enable location in browser settings or type your address.
              </p>
            )}
          </div>
        );

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={value || false}
              onCheckedChange={(c) => handleFieldChange(field.id, c)}
              disabled={submitting || submitted}
            />
            <Label htmlFor={field.id} className="text-sm">{field.label}</Label>
          </div>
        );

      case "switch":
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={field.id}
              checked={value || false}
              onCheckedChange={(c) => handleFieldChange(field.id, c)}
              disabled={submitting || submitted}
            />
            <Label htmlFor={field.id} className="text-sm">{field.label}</Label>
          </div>
        );

      case "radio":
        return (
          <RadioGroup value={value || ""} onValueChange={(v) => handleFieldChange(field.id, v)} disabled={submitting || submitted}>
            {options.map((opt: any) => (
              <div key={opt.value} className="flex items-center space-x-2">
                <RadioGroupItem value={opt.value} id={`${field.id}-${opt.value}`} />
                <Label htmlFor={`${field.id}-${opt.value}`} className="text-sm">{opt.label}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "select":
        return (
          <Select value={value || ""} onValueChange={(v) => handleFieldChange(field.id, v)} disabled={submitting || submitted}>
            <SelectTrigger className={error ? "border-red-500" : ""}>
              <SelectValue placeholder={field.placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt: any) => (
                <SelectItem key={opt.value || opt.id} value={opt.value || opt.id}>
                  {opt.label}
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
            />
            <div className="text-center text-sm text-muted-foreground">Value: {value || 0}</div>
          </div>
        );

      case "rating":
        return (
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleFieldChange(field.id, r)}
                disabled={submitting || submitted}
                className="p-1 hover:scale-110 transition-transform"
              >
                <Star className={`h-4 w-4 ${r <= (value || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
              </button>
            ))}
            <span className="pl-2 text-sm text-muted-foreground">{value ? `${value}/5` : "Not rated"}</span>
          </div>
        );

      case "lookup":
        const lookupData = {
          id: field.id,
          label: field.label,
          type: field.type,
          placeholder: field.placeholder,
          description: field.description,
          validation: field.validation || { required: false },
          lookup: field.lookup,
        };
        return (
          <LookupField
            field={lookupData}
            value={value}
            onChange={(v) => handleFieldChange(field.id, v)}
            disabled={submitting || submitted}
            error={error}
          />
        );

      case "file":
      case "image":
      case "video":
      case "signature":
        return (
          <FileUploadZone
            fieldType={fieldType as "image" | "file" | "signature" | "video"}
            currentValue={value}
            onUploadComplete={(url) => handleFieldChange(field.id, url)}
            onClear={() => handleClearFile(field.id)}
            disabled={submitting || submitted}
            maxSize={10}
          />
        );

      case "camera":
        return (
          <CameraCapture
            onCapture={(img) => handleFieldChange(field.id, img)}
            capturedImage={value || null}
            onClear={() => handleFieldChange(field.id, "")}
          />
        );

      case "hidden":
        return <Input {...fieldProps} type="hidden" value={value || field.defaultValue || ""} />;

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

  if (submitted) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4 animate-bounce" />
            <h2 className="text-xl font-semibold mb-2">Thank You!</h2>
            <p className="text-muted-foreground mb-4">
              {form?.submissionMessage || "Your form has been submitted successfully."}
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({});
                  setErrors({});
                }}
                variant="outline"
              >
                Submit Another
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
          <div className="py-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Form Not Found</h2>
            <p className="text-muted-foreground">This form may have been removed or is not published.</p>
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
                      {section.description && <p className="text-sm text-muted-foreground mt-1">{section.description}</p>}
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