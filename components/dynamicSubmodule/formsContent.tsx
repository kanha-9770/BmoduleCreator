"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Filter } from "lucide-react"

interface Form {
  id: string
  name: string
  description?: string
  moduleId: string
  isPublished: boolean
  updatedAt: string
  sections: any[]
}

interface FormsContentProps {
  forms: Form[]
  selectedForm: Form | null
  setSelectedForm: (form: Form | null) => void
  openFormDialog: (formId: string) => void
  handlePublishForm?: (form: Form) => void
}

const FormsContent: React.FC<FormsContentProps> = ({
  forms,
  setSelectedForm,
  openFormDialog,
}) => {
  const visible = forms.slice(0, 2)
  const hasMore = forms.length > 2

  const FormButton = (f: Form) => (
    <Button
      key={f.id}
      variant="outline"
      className="w-full justify-start text-left text-blue-600 hover:text-blue-800 border-blue-600 hover:border-blue-800"
      onClick={(e) => {
        e.stopPropagation()
        openFormDialog(f.id)
      }}
    >
      {f.name}
    </Button>
  )

  return (
    <div className="border-gray-300">
      {forms.length ? (
        <div className="grid grid-cols-4 gap-2">
          {/* ---- LEFT EMPTY CELLS TO PUSH EVERYTHING TO THE RIGHT ---- */}
          {Array.from({ length: 4 - (visible.length + (hasMore ? 1 : 0)) }).map(
            (_, i) => (
              <div key={`empty-left-${i}`} className="col-span-1" />
            )
          )}

          {/* ---- VISIBLE FORM BUTTONS (max 2) ---- */}
          {visible.map((f) => (
            <div
              key={f.id}
              onClick={() => setSelectedForm(f)}
              className="flex items-center"
            >
              {FormButton(f)}
            </div>
          ))}

          {/* ---- FUNNEL ICON (tiny, not full width) ---- */}
          {hasMore && (
            <div className="flex items-center justify-center">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-md text-muted-foreground hover:text-foreground"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Filter className="h-4 w-4" />
                    <span className="sr-only">Open all forms</span>
                  </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      All Forms ({forms.length})
                    </DialogTitle>
                  </DialogHeader>

                  <ScrollArea className="max-h-[60vh] pr-4">
                    <div className="space-y-2 py-2">
                      {forms.map(FormButton)}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          No forms in this module
        </div>
      )}
    </div>
  )
}

export default FormsContent