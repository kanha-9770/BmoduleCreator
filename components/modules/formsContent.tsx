import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
      <table className="w-full text-xs">
        <thead className="bg-gray-100 sticky top-0 z-10 border-b border-gray-300">
          <tr>
            <th className="p-2 text-left font-semibold text-gray-700 border-r border-gray-300">
              Name
            </th>
            <th className="p-2 text-left font-semibold text-gray-700 border-r border-gray-300">
              Status
            </th>
            <th className="p-2 text-left font-semibold text-gray-700 border-r border-gray-300">
              Updated
            </th>
            <th className="p-2 text-right font-semibold text-gray-700">
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
              <td className="p-2 text-gray-700 border-r border-gray-300">
                <button
                  className="text-blue-500 hover:underline"
                  onClick={() => openFormDialog(form.id)}
                >
                  {form.name}
                </button>
              </td>
              <td className="p-2 border-r border-gray-300">
                <div

                  className="text-xs"
                >
                  {form.isPublished ? "Published" : "Draft"}
                </div>
              </td>
              <td className="p-2 text-gray-700 border-r border-gray-300">
                {new Date(form.updatedAt).toLocaleDateString()}
              </td>
              <td className="p-2 text-right">
                <div className="flex gap-1 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePublishForm(form)}
                    className="text-xs border-gray-300 hover:bg-gray-100"
                  >
                    {form.isPublished ? "Unpublish" : "Publish"}
                  </Button>
                  <NextLink href={`/builder/${form.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs border-gray-300 hover:bg-gray-100 bg-transparent"
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
            <th className="p-3 text-left font-semibold text-gray-700">Name</th>
            <th className="p-3 text-left font-semibold text-gray-700">
              Status
            </th>
            <th className="p-3 text-left font-semibold text-gray-700">
              Updated
            </th>
            <th className="p-3 text-right font-semibold text-gray-700">
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
              <td className="p-3 text-gray-700">
                <button
                  className="text-blue-500 hover:underline"
                  onClick={() => openFormDialog(form.id)}
                >
                  {form.name}
                </button>
              </td>
              <td className="p-3">
                <div
                  className="text-xs"
                >
                  {form.isPublished ? "Published" : "Draft"}
                </div>
              </td>
              <td className="p-3 text-gray-700">
                {new Date(form.updatedAt).toLocaleDateString()}
              </td>
              <td className="p-3 text-right">
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePublishForm(form)}
                    className="text-xs border-gray-300 hover:bg-gray-100"
                  >
                    {form.isPublished ? "Unpublish" : "Publish"}
                  </Button>
                  <NextLink href={`/builder/${form.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs border-gray-300 hover:bg-gray-100 bg-transparent"
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {forms.map((form) => (
        <Card
          key={form.id}
          className="hover:shadow-md transition-shadow duration-200 border border-gray-300 rounded-lg"
        >
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-gray-700 ">
              <button
                className="text-blue-500 hover:underline"
                onClick={() => openFormDialog(form.id)}
              >
                {form.name}
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div
                  className="text-xs"
                >
                  {form.isPublished ? "Published" : "Draft"}
                </div>
                <span className="text-xs text-gray-500">
                  Updated {new Date(form.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePublishForm(form)}
                  className="text-xs border-gray-300 hover:bg-gray-100"
                >
                  {form.isPublished ? "Unpublish" : "Publish"}
                </Button>
                <NextLink href={`/builder/${form.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs border-gray-300 hover:bg-gray-100 bg-transparent"
                  >
                    Edit
                  </Button>
                </NextLink>
              </div>
            </div>
          </CardContent>
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
          <CardContent className="p-4 flex items-center justify-between">
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
                  <div
                    className="text-xs"
                  >
                    {form.isPublished ? "Published" : "Draft"}
                  </div>
                  <span className="text-xs text-gray-500">
                    Updated {new Date(form.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePublishForm(form)}
                className="text-xs border-gray-300 hover:bg-gray-100"
              >
                {form.isPublished ? "Unpublish" : "Publish"}
              </Button>
              <NextLink href={`/builder/${form.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-gray-300 hover:bg-gray-100 bg-transparent"
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
    <Card className="border-gray-300 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">
          Forms ({forms.length})
        </CardTitle>
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
          <div className="text-center py-4 text-gray-500">
            No forms in this module
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FormsContent;
