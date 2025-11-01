import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import NextLink from "next/link";

interface Form {
  id: string;
  name: string;
  description?: string;
  moduleId: string;
  isPublished: boolean;
  updatedAt: string;
  sections: any[];
}

interface FormsContentProps {
  forms: Form[];
  selectedForm: Form | null;
  viewMode: "excel" | "table" | "grid" | "list";
  setSelectedForm: (form: Form | null) => void;
  openFormDialog: (formId: string) => void;
  handlePublishForm: (form: Form) => void;
}

const FormsContent: React.FC<FormsContentProps> = ({
  forms,
  selectedForm,
  viewMode,
  setSelectedForm,
  openFormDialog,
  handlePublishForm,
}) => {
  const renderFormsExcel = (forms: Form[]) => (
    <div className="overflow-auto border border-gray-300 rounded-lg shadow-sm bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 sticky top-0 z-10 border-b border-gray-300">
          <tr>
            <th className="py-1.5 px-4 text-center font-semibold text-gray-700 border-r border-gray-300">
              Name
            </th>
            <th className="py-1.5 px-4 text-center font-semibold text-gray-700 border-r border-gray-300">
              Status
            </th>
            <th className="py-1.5 px-4 text-center font-semibold text-gray-700 border-r border-gray-300">
              Updated
            </th>
            <th className="py-1.5 px-4 text-center font-semibold text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {forms.map((form, index) => (
            <tr
              key={form.id}
              className={`border-b border-gray-300 hover:bg-gray-50 cursor-pointer ${selectedForm?.id === form.id
                ? "bg-blue-50"
                : index % 2 === 0
                  ? "bg-white"
                  : "bg-gray-50"
                }`}
              onClick={() => setSelectedForm(form)}
            >
              <td className="py-1.5 px-4 text-gray-700 border-r border-gray-300 text-center">
                <button
                  className="text-blue-500 hover:underline text-xs"
                  onClick={() => openFormDialog(form.id)}
                >
                  {form.name}
                </button>
              </td>
              <td className="py-1.5 px-4 border-r border-gray-300 text-center">
                <div className="text-xs">
                  {form.isPublished ? "Published" : "Draft"}
                </div>
              </td>
              <td className="py-1.5 px-4 text-gray-700 border-r border-gray-300 text-center text-xs">
                {new Date(form.updatedAt).toLocaleDateString()}
              </td>
              <td className="py-1.5 px-4 text-right">
                <div className="flex gap-1 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePublishForm(form)}
                    className="h-6 text-xs border-gray-300 hover:bg-gray-100"
                  >
                    {form.isPublished ? "Unpublish" : "Publish"}
                  </Button>
                  <NextLink href={`/builder/${form.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 text-xs border-gray-300 hover:bg-gray-100 bg-transparent"
                    >
                      Edit
                    </Button>
                  </NextLink>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderFormsTable = (forms: Form[]) => (
    <div className="overflow-x-auto border border-gray-300 rounded-lg shadow-sm">
      <table className="w-full text-sm bg-white">
        <thead className="bg-gray-100">
          <tr className="border-b border-gray-300">
            <th className="py-1.5 px-4 text-center font-semibold text-gray-700">Name</th>
            <th className="py-1.5 px-4 text-center font-semibold text-gray-700">
              Status
            </th>
            <th className="py-1.5 px-4 text-center font-semibold text-gray-700">
              Updated
            </th>
            <th className="py-1.5 px-4 text-center font-semibold text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {forms.map((form, index) => (
            <tr
              key={form.id}
              className={`border-b border-gray-300 hover:bg-gray-50 cursor-pointer ${selectedForm?.id === form.id
                ? "bg-blue-50"
                : index % 2 === 0
                  ? "bg-white"
                  : "bg-gray-50"
                }`}
              onClick={() => setSelectedForm(form)}
            >
              <td className="py-1.5 px-4 text-gray-700 text-center">
                <button
                  className="text-blue-500 hover:underline text-xs"
                  onClick={() => openFormDialog(form.id)}
                >
                  {form.name}
                </button>
              </td>
              <td className="py-1.5 px-4 text-center">
                <div className="text-xs">
                  {form.isPublished ? "Published" : "Draft"}
                </div>
              </td>
              <td className="py-1.5 px-4 text-gray-700 text-center text-xs">
                {new Date(form.updatedAt).toLocaleDateString()}
              </td>
              <td className="py-1.5 px-4 text-center">
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePublishForm(form)}
                    className="h-6 text-xs border-gray-300 hover:bg-gray-100"
                  >
                    {form.isPublished ? "Unpublish" : "Publish"}
                  </Button>
                  <NextLink href={`/builder/${form.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 text-xs border-gray-300 hover:bg-gray-100 bg-transparent"
                    >
                      Edit
                    </Button>
                  </NextLink>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderFormsGrid = (forms: Form[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {forms.map((form) => (
        <Card
          key={form.id}
          className="hover:shadow-md transition-shadow duration-200 border border-gray-300 rounded-lg"
        >
          <div className="px-3 pt-2 pb-2">
            <div className="text-sm font-semibold text-gray-700">
              <button
                className="text-blue-500 hover:underline"
                onClick={() => openFormDialog(form.id)}
              >
                {form.name}
              </button>
            </div>
          </div>
          <div className="px-3 pb-2">
            <div className="space-y-2">
              <div className="text-xs">
                {form.isPublished ? "Published" : "Draft"}
              </div>
              <div className="text-xs text-gray-500">
                Updated {new Date(form.updatedAt).toLocaleDateString()}
              </div>

              <div className="flex space-x-2 items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePublishForm(form)}
                  className="h-6 text-xs border-gray-300 hover:bg-gray-100"
                >
                  {form.isPublished ? "Unpublish" : "Publish"}
                </Button>
                <NextLink href={`/builder/${form.id}`} >
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs border-gray-300 hover:bg-gray-100"
                  >
                    Edit
                  </Button>
                </NextLink>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderFormsList = (forms: Form[]) => (
    <div className="space-y-2">
      {forms.map((form) => (
        <Card
          key={form.id}
          className="hover:shadow-md transition-shadow duration-200 border border-gray-300 rounded-lg"
        >
          <CardContent className="py-2 px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-gray-400" />
              <div>
                <h3 className="text-sm font-semibold text-gray-700">
                  <button
                    className="text-blue-500 hover:underline"
                    onClick={() => openFormDialog(form.id)}
                  >
                    {form.name}
                  </button>
                </h3>
                <div className="flex items-center gap-2">
                  <div className="text-xs">
                    {form.isPublished ? "Published" : "Draft"}
                  </div>
                  <span className="text-xs text-gray-500">
                    Updated {new Date(form.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2 items-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePublishForm(form)}
                className="h-6 text-xs border-gray-300 hover:bg-gray-100"
              >
                {form.isPublished ? "Unpublish" : "Publish"}
              </Button>
              <NextLink href={`/builder/${form.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs border-gray-300 hover:bg-gray-100 bg-transparent"
                >
                  Edit
                </Button>
              </NextLink>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="border-gray-300 shadow-sm bg-white rounded-lg p-4">
      <div>
        <CardTitle className="text-[1.1rem] font-semibold text-gray-800 pb-2">
          Forms
        </CardTitle>
      </div>
      <div>
        {forms.length ? (
          <>
            {viewMode === "excel" && renderFormsExcel(forms)}
            {viewMode === "table" && renderFormsTable(forms)}
            {viewMode === "grid" && renderFormsGrid(forms)}
            {viewMode === "list" && renderFormsList(forms)}
          </>
        ) : (
          <div className="text-center py-4 text-gray-500">
            No forms in this module
          </div>
        )}
      </div>
    </div>
  );
};

export default FormsContent;
