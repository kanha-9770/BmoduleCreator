"use client"

import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

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
  handlePublishForm: (form: Form) => void
}

const FormsContent: React.FC<FormsContentProps> = ({
  forms,
  setSelectedForm,
  openFormDialog,
}) => {
  return (
    <div className="border-gray-300">
      <div>
        {forms.length ? (
          <div className="grid grid-cols-4 gap-2">
            {/* Add empty divs to push forms to the right */}
            {Array.from({ length: 4 - forms.length }).map((_, index) => (
              <div key={`empty-${index}`} className="col-span-1" />
            ))}
            {forms.map((form) => (
              <div
                key={form.id}
                onClick={() => setSelectedForm(form)}
                className="flex items-center"
              >
                <Button
                  variant="outline"
                  className="text-blue-500 hover:text-blue-700 w-full border-blue-500 hover:border-blue-700"
                  onClick={(e) => {
                    e.stopPropagation() // Prevent triggering setSelectedForm when clicking the button
                    openFormDialog(form.id)
                  }}
                >
                  {form.name}
                </Button>
              </div>     
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">No forms in this module</div>
        )}
      </div>
    </div>
  )
}

export default FormsContent