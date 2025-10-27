"use client";

import { useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
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
import { GripVertical, Settings, Trash2, EyeOff, Star, Copy, ImageIcon } from "lucide-react";
import type { FormField, FieldOption } from "@/types/form-builder";
import { LookupField } from "@/components/lookup-field";
import FieldSettings from "@/components/field-settings";
import CameraCapture from "@/components/camera-capture";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";

interface FieldComponentProps {
  field: FormField;
  isOverlay?: boolean;
  isInSubform?: boolean;
  onUpdate: (fieldId: string, updates: Partial<FormField>) => Promise<void>;
  onDelete: (fieldId: string) => void;
  onCopy: (field: FormField) => void;
}

export default function FieldComponent({
  field,
  isOverlay = false,
  isInSubform = false,
  onUpdate,
  onDelete,
  onCopy,
}: FieldComponentProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [previewValue, setPreviewValue] = useState<any>(field?.defaultValue || "");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null); // Changed from cameraInputRef to fileInputRef for general use

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: field?.id || `field_${uuidv4()}`,
    data: {
      type: "Field",
      field,
    },
    disabled: isOverlay || showSettings || !field,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 200ms ease",
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  // Fetch user's location for location field
  useEffect(() => {
    if (field.type === "location" && !previewValue) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const locationString = `${latitude}, ${longitude}`;
            setPreviewValue(locationString);
            onUpdate(field.id, { defaultValue: locationString }).catch((error) => {
              console.error("Error updating location field:", error);
              toast({
                title: "Error",
                description: "Failed to save location",
                variant: "destructive",
              });
            });
          },
          (error) => {
            console.error("Geolocation error:", error);
            toast({
              title: "Error",
              description:
                error.code === error.PERMISSION_DENIED
                  ? "Location access denied. Please enable location permissions."
                  : "Unable to fetch location. Please try again.",
              variant: "destructive",
            });
            setPreviewValue("Location unavailable");
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      } else {
        toast({
          title: "Error",
          description: "Geolocation is not supported by this browser.",
          variant: "destructive",
        });
        setPreviewValue("Geolocation not supported");
      }
    }
  }, [field.type, field.id, previewValue, onUpdate, toast]);

  if (!field) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4 text-center">
          <p className="text-red-600 text-sm">Error: Field data is missing</p>
        </CardContent>
      </Card>
    );
  }

  const handleDeleteField = () => {
    if (window.confirm("Are you sure you want to delete this field?")) {
      onDelete(field.id);
      toast({
        title: "Success",
        description: `Field "${field.label}" deleted successfully`,
      });
    }
  };

  const handleCopyField = () => {
    const newField: FormField = {
      ...field,
      id: `field_${uuidv4()}`,
      label: `${field.label} (Copy)`,
      order: field.order + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    onCopy(newField);
    toast({
      title: "Success",
      description: `Field "${field.label}" duplicated successfully`,
    });
  };

  const handleUpdateField = async (updates: Partial<FormField>) => {
    try {
      const completeUpdates = {
        ...updates,
        sectionId: updates.sectionId ?? field.sectionId,
        subformId: updates.subformId ?? field.subformId,
        type: updates.type ?? field.type,
        label: updates.label ?? field.label,
      };

      await onUpdate(field.id, completeUpdates);
      setShowSettings(false);
      toast({
        title: "Success",
        description: `Field "${field.label}" updated successfully`,
      });
    } catch (error: any) {
      console.error("Error updating field:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update field",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setCapturedImage(result);
        setPreviewValue(result);
        onUpdate(field.id, { defaultValue: result }).catch((error) => {
          console.error("Error updating field with file:", error);
          toast({
            title: "Error",
            description: "Failed to save file",
            variant: "destructive",
          });
        });
      };
      reader.onerror = () => {
        toast({
          title: "Error",
          description: "Failed to read file",
          variant: "destructive",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = () => {
    setCapturedImage(null);
    setPreviewValue("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onUpdate(field.id, { defaultValue: "" }).catch((error) => {
      console.error("Error clearing file:", error);
      toast({
        title: "Error",
        description: "Failed to clear file",
        variant: "destructive",
      });
    });
  };

  const renderFieldPreview = () => {
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
            type={field.type}
            placeholder={field.placeholder || ""}
            value={previewValue}
            onChange={(e) => setPreviewValue(e.target.value)}
            disabled
            className={isInSubform ? "border-purple-200 focus:border-purple-400" : ""}
          />
        );
      case "password":
        return (
          <Input
            type="password"
            placeholder={field.placeholder || ""}
            value={previewValue}
            onChange={(e) => setPreviewValue(e.target.value)}
            disabled
            className={isInSubform ? "border-purple-200 focus:border-purple-400" : ""}
          />
        );
      case "textarea":
        return (
          <Textarea
            placeholder={field.placeholder || ""}
            value={previewValue}
            onChange={(e) => setPreviewValue(e.target.value)}
            rows={field.properties?.rows || 3}
            disabled
            className={isInSubform ? "border-purple-200 focus:border-purple-400" : ""}
          />
        );
      case "date":
        return (
          <Input
            type="date"
            value={previewValue}
            onChange={(e) => setPreviewValue(e.target.value)}
            disabled
            className={isInSubform ? "border-purple-200 focus:border-purple-400" : ""}
          />
        );
      case "datetime":
        return (
          <Input
            type="datetime-local"
            value={previewValue}
            onChange={(e) => setPreviewValue(e.target.value)}
            disabled
            className={isInSubform ? "border-purple-200 focus:border-purple-400" : ""}
          />
        );
      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox checked={previewValue} onCheckedChange={setPreviewValue} disabled />
            <Label className={`text-sm ${isInSubform ? "text-purple-800" : ""}`}>{field.label}</Label>
          </div>
        );
      case "switch":
        return (
          <div className="flex items-center space-x-2">
            <Switch checked={previewValue} onCheckedChange={setPreviewValue} disabled />
            <Label className={`text-sm ${isInSubform ? "text-purple-800" : ""}`}>{field.label}</Label>
          </div>
        );
      case "radio":
        return (
          <RadioGroup value={previewValue} onValueChange={setPreviewValue} disabled>
            {options.map((option: FieldOption) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} />
                <Label className={`text-sm ${isInSubform ? "text-purple-800" : ""}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case "select":
        return (
          <Select value={previewValue} onValueChange={setPreviewValue} disabled>
            <SelectTrigger className={isInSubform ? "border-purple-200 focus:border-purple-400" : ""}>
              <SelectValue placeholder={field.placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option: FieldOption) => (
                <SelectItem key={option.id} value={option.value}>
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
              value={[previewValue || field.validation?.min || 0]}
              onValueChange={(vals) => setPreviewValue(vals[0])}
              max={field.validation?.max || 100}
              min={field.validation?.min || 0}
              step={field.properties?.step || 1}
              disabled
              className="w-full"
            />
            <div className={`text-center text-sm ${isInSubform ? "text-purple-600" : "text-muted-foreground"}`}>
              Value: {previewValue || field.validation?.min || 0}
            </div>
          </div>
        );
      case "rating":
        return (
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <Star
                key={rating}
                className={`h-4 w-4 ${rating <= (previewValue || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
              />
            ))}
            <span className={`pl-2 text-sm ${isInSubform ? "text-purple-600" : "text-muted-foreground"}`}>
              {previewValue ? `${previewValue}/5` : "Not rated"}
            </span>
          </div>
        );
      case "lookup":
        return <LookupField field={lookupFieldData} value={previewValue} onChange={setPreviewValue} disabled={true} />;
      case "file":
        return (
          <Input
            type="file"
            disabled
            multiple={field.properties?.multiple || false}
            accept={field.properties?.accept || undefined}
            className={isInSubform ? "border-purple-200 focus:border-purple-400" : ""}
          />
        );
      case "camera":
        return (
          <CameraCapture
            onCapture={(imageData) => {
              setCapturedImage(imageData);
              setPreviewValue(imageData);
              onUpdate(field.id, { defaultValue: imageData }).catch((error) => {
                console.error("Error updating camera field:", error);
                toast({
                  title: "Error",
                  description: "Failed to save captured image",
                  variant: "destructive",
                });
              });
            }}
            capturedImage={capturedImage}
            onClear={handleClearImage}
            disabled={true}
            className={isInSubform ? "border-purple-200 focus:border-purple-400" : ""}
          />
        );
      case "image":
      case "signature":
        return (
          <div className="space-y-2">
            {capturedImage ? (
              <div className="relative">
                <img
                  src={capturedImage}
                  alt={field.type === "image" ? "Uploaded image" : "Uploaded signature"}
                  className="max-w-full h-auto rounded border"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 bg-white/80 hover:bg-white"
                  onClick={handleClearImage}
                  disabled
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Input
                  type="file"
                  ref={fileInputRef}
                  accept={field.type === "image" ? "image/*" : "image/png,image/jpeg"}
                  onChange={handleFileChange}
                  disabled
                  className={isInSubform ? "border-purple-200 focus:border-purple-400" : ""}
                />
                <ImageIcon className={`h-5 w-5 ${isInSubform ? "text-purple-600" : "text-gray-500"}`} />
              </div>
            )}
          </div>
        );
      case "location":
        return (
          <Input
            type="text"
            placeholder={field.placeholder || "Fetching location..."}
            value={previewValue}
            onChange={(e) => setPreviewValue(e.target.value)}
            disabled
            className={isInSubform ? "border-purple-200 focus:border-purple-400" : ""}
          />
        );
      case "hidden":
        return (
          <div
            className={`flex items-center space-x-2 p-2 rounded border-dashed border-2 ${isInSubform ? "bg-purple-50 border-purple-200" : "bg-gray-100 border-gray-300"}`}
          >
            <EyeOff className={`h-4 w-4 ${isInSubform ? "text-purple-500" : "text-gray-500"}`} />
            <span className={`text-sm ${isInSubform ? "text-purple-600" : "text-gray-500"}`}>Hidden Field</span>
            <Badge variant="outline" className={`text-xs ${isInSubform ? "border-purple-300 text-purple-700" : ""}`}>
              {field.defaultValue || "No value"}
            </Badge>
          </div>
        );
      default:
        return (
          <Input
            placeholder={field.placeholder || ""}
            value={previewValue}
            onChange={(e) => setPreviewValue(e.target.value)}
            disabled
            className={isInSubform ? "border-purple-200 focus:border-purple-400" : ""}
          />
        );
    }
  };

  const getCardStyles = () => {
    if (isInSubform) {
      return `group relative transition-all duration-200 border-l-4 border-l-purple-400 ${isDragging ? "shadow-2xl scale-105 rotate-1 border-purple-500 bg-purple-100" : "hover:shadow-md bg-purple-50/50"} ${!field.visible ? "opacity-50" : ""} ${field.readonly ? "bg-purple-100/50" : ""}`;
    }
    return `group relative transition-all duration-200 ${isDragging ? "shadow-2xl scale-105 rotate-1 border-blue-400 bg-blue-50" : "hover:shadow-md"} ${!field.visible ? "opacity-50" : ""} ${field.readonly ? "bg-gray-50" : ""}`;
  };

  const getGripStyles = () => {
    if (isInSubform) {
      return `cursor-grab hover:cursor-grabbing p-1 rounded hover:bg-purple-200 text-purple-600 ${isDragging ? "bg-purple-500 text-white" : ""}`;
    }
    return `cursor-grab hover:cursor-grabbing p-1 rounded hover:bg-gray-100 text-gray-400 ${isDragging ? "bg-blue-500 text-white" : ""}`;
  };

  const getActionButtonStyles = () => {
    if (isInSubform) {
      return "hover:bg-purple-200 text-purple-600";
    }
    return "";
  };

  return (
    <>
      <Card ref={setNodeRef} style={style} className={getCardStyles()}>
        <CardContent className="py-2 px-3 border rounded-lg">
          <div className="flex items-start space-x-2">
            <div
              {...attributes}
              {...listeners}
              className={`opacity-0 group-hover:opacity-100 transition-opacity ${getGripStyles()}`}
            >
              <GripVertical className="h-4 w-4" />
            </div>
            <div className="flex-1 space-y-2">
              {field.type !== "checkbox" &&
                field.type !== "switch" &&
                field.type !== "hidden" &&
                ( // Exclude location from label display if desired
                  <Label className={`text-sm font-medium ${isInSubform ? "text-purple-800" : ""}`}>
                    {field.label}
                    {field.validation?.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                )}
              {renderFieldPreview()}
            </div>
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-1 right-1">
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${getActionButtonStyles()}`}
                onClick={handleCopyField}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${getActionButtonStyles()}`}
                onClick={() => setShowSettings(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleDeleteField}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {showSettings && (
        <FieldSettings
          field={field}
          open={showSettings}
          onOpenChange={setShowSettings}
          onUpdate={handleUpdateField}
        />
      )}
    </>
  );
}