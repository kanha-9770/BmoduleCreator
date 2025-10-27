"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText } from "lucide-react"

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
  viewMode: "excel" | "table" | "grid" | "list"
  setSelectedForm: (form: Form | null) => void
  openFormDialog: (formId: string) => void
  handlePublishForm: (form: Form) => void
}

const FormsContent: React.FC<FormsContentProps> = ({
  forms,
  selectedForm,
  viewMode,
  setSelectedForm,
  openFormDialog,
}) => {
  const renderFormsExcel = (forms: Form[]) => (
    <div className="overflow-auto border border-gray-300 rounded-lg shadow-sm bg-white">
      <table className="w-full text-xs">
        <thead className="bg-gray-100 sticky top-0 z-10 border-b border-gray-300">
          <tr>
            <th className="p-2 text-left font-semibold text-gray-700 border-r border-gray-300">Name</th>
            <th className="p-2 text-left font-semibold text-gray-700 border-r border-gray-300">Status</th>
            <th className="p-2 text-left font-semibold text-gray-700">Updated</th>
          </tr>
        </thead>
        <tbody>
          {forms.map((form, index) => (
            <tr
              key={form.id}
              className={`border-b border-gray-300 hover:bg-gray-50 cursor-pointer ${
                selectedForm?.id === form.id ? "bg-blue-50" : index % 2 === 0 ? "bg-white" : "bg-gray-50"
              }`}
              onClick={() => setSelectedForm(form)}
            >
              <td className="p-2 text-gray-700 border-r border-gray-300">
                <Button
                  variant="link"
                  className="text-blue-500 hover:underline p-0 h-auto"
                  onClick={() => openFormDialog(form.id)}
                >
                  {form.name}
                </Button>
              </td>
              <td className="p-2 border-r border-gray-300">
                <Badge variant={form.isPublished ? "default" : "secondary"} className="text-xs">
                  {form.isPublished ? "Published" : "Draft"}
                </Badge>
              </td>
              <td className="p-2 text-gray-700">{new Date(form.updatedAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderFormsTable = (forms: Form[]) => (
    <div className="overflow-x-auto border border-gray-300 rounded-lg shadow-sm">
      <table className="w-full text-sm bg-white">
        <thead className="bg-gray-100">
          <tr className="border-b border-gray-300">
            <th className="p-3 text-left font-semibold text-gray-700">Name</th>
            <th className="p-3 text-left font-semibold text-gray-700">Status</th>
            <th className="p-3 text-left font-semibold text-gray-700">Updated</th>
          </tr>
        </thead>
        <tbody>
          {forms.map((form, index) => (
            <tr
              key={form.id}
              className={`border-b border-gray-300 hover:bg-gray-50 cursor-pointer ${
                selectedForm?.id === form.id ? "bg-blue-50" : index % 2 === 0 ? "bg-white" : "bg-gray-50"
              }`}
              onClick={() => setSelectedForm(form)}
            >
              <td className="p-3 text-gray-700">
                <Button
                  variant="link"
                  className="text-blue-500 hover:underline p-0 h-auto"
                  onClick={() => openFormDialog(form.id)}
                >
                  {form.name}
                </Button>
              </td>
              <td className="p-3">
                <Badge variant={form.isPublished ? "default" : "secondary"} className="text-xs">
                  {form.isPublished ? "Published" : "Draft"}
                </Badge>
              </td>
              <td className="p-3 text-gray-700">{new Date(form.updatedAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderFormsGrid = (forms: Form[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {forms.map((form) => (
        <Card
          key={form.id}
          className="hover:shadow-md transition-shadow duration-200 border border-gray-300 rounded-lg cursor-pointer"
          onClick={() => setSelectedForm(form)}
        >
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-gray-700">
              <Button
                variant="link"
                className="text-blue-500 hover:underline p-0 h-auto"
                onClick={(e) => {
                  e.stopPropagation()
                  openFormDialog(form.id)
                }}
              >
                {form.name}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={form.isPublished ? "default" : "secondary"} className="text-xs">
                  {form.isPublished ? "Published" : "Draft"}
                </Badge>
                <span className="text-xs text-gray-500">Updated {new Date(form.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderFormsList = (forms: Form[]) => (
    <div className="space-y-2">
      {forms.map((form) => (
        <Card
          key={form.id}
          className="hover:shadow-md transition-shadow duration-200 border border-gray-300 rounded-lg cursor-pointer"
          onClick={() => setSelectedForm(form)}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <FileText className="h-5 w-5 text-gray-400" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-700">
                <Button
                  variant="link"
                  className="text-blue-500 hover:underline p-0 h-auto"
                  onClick={(e) => {
                    e.stopPropagation()
                    openFormDialog(form.id)
                  }}
                >
                  {form.name}
                </Button>
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={form.isPublished ? "default" : "secondary"} className="text-xs">
                  {form.isPublished ? "Published" : "Draft"}
                </Badge>
                <span className="text-xs text-gray-500">Updated {new Date(form.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <Card className="border-gray-300 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">Forms ({forms.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {forms.length ? (
          <>
            {viewMode === "excel" && renderFormsExcel(forms)}
            {viewMode === "table" && renderFormsTable(forms)}
            {viewMode === "grid" && renderFormsGrid(forms)}
            {viewMode === "list" && renderFormsList(forms)}
          </>
        ) : (
          <div className="text-center py-4 text-gray-500">No forms in this module</div>
        )}
      </CardContent>
    </Card>
  )
}

export default FormsContent
