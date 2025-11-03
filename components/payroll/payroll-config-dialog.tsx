"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Form {
  id: string
  name: string
  description: string | null
  module: {
    name: string
  }
}

interface PayrollConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfigSaved: () => void
}

export function PayrollConfigDialog({ open, onOpenChange, onConfigSaved }: PayrollConfigDialogProps) {
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [attendanceFormId, setAttendanceFormId] = useState("")
  const [leaveFormId, setLeaveFormId] = useState("")

  useEffect(() => {
    if (open) {
      fetchForms()
    }
  }, [open])

  const fetchForms = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/payroll/forms")
      const data = await response.json()

      if (data.success) {
        setForms(data.forms)
      } else {
        toast.error("Failed to load forms")
      }
    } catch (error) {
      console.error("[v0] Error fetching forms:", error)
      toast.error("Failed to load forms")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!attendanceFormId || !leaveFormId) {
      toast.error("Please select both attendance and leave forms")
      return
    }

    if (attendanceFormId === leaveFormId) {
      toast.error("Attendance and leave forms must be different")
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/payroll/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendanceFormId,
          leaveFormId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Payroll configuration saved successfully!")
        onConfigSaved()
        onOpenChange(false)
      } else {
        toast.error(data.error || "Failed to save configuration")
      }
    } catch (error) {
      console.error("[v0] Error saving config:", error)
      toast.error("Failed to save configuration")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configure Payroll Forms
          </DialogTitle>
          <DialogDescription>
            Select which forms contain attendance and leave data for payroll calculation
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="attendance-form">Attendance Form</Label>
              <Select value={attendanceFormId} onValueChange={setAttendanceFormId}>
                <SelectTrigger id="attendance-form">
                  <SelectValue placeholder="Select attendance form" />
                </SelectTrigger>
                <SelectContent>
                  {forms.map((form) => (
                    <SelectItem key={form.id} value={form.id}>
                      {form.name} ({form.module.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Form containing employee attendance records with work hours and dates
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="leave-form">Leave Form</Label>
              <Select value={leaveFormId} onValueChange={setLeaveFormId}>
                <SelectTrigger id="leave-form">
                  <SelectValue placeholder="Select leave form" />
                </SelectTrigger>
                <SelectContent>
                  {forms.map((form) => (
                    <SelectItem key={form.id} value={form.id}>
                      {form.name} ({form.module.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Form containing employee leave records with leave types and dates
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
