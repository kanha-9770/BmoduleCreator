import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Eye, BarChart3, Copy } from "lucide-react";
import NextLink from "next/link";

interface Form {
  id: string;
  name: string;
  description?: string;
  moduleId: string;
  isPublished: boolean;
  updatedAt: string;
  sections: any[]; // Adjust as needed
}

interface FormDetailsPanelProps {
  selectedForm: Form | null;
  copyFormLink: (formId: string) => void;
}

const FormDetailsPanel: React.FC<FormDetailsPanelProps> = ({ selectedForm, copyFormLink }) => {
  if (!selectedForm) return null;

  return (
    <div className="w-80 bg-white border-l border-gray-200 shadow-sm p-4 flex-shrink-0 overflow-y-auto">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Form Details</h2>
      <Card className="border-gray-300 shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-700">{selectedForm.name}</h3>
            <p className="text-sm text-gray-600">
              Status: {selectedForm.isPublished ? "Published" : "Draft"}
            </p>
          </div>
          {selectedForm.isPublished && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Public Link:</p>
              <div className="flex gap-2">
                <Input
                  value={`${window.location.origin}/form/${selectedForm.id}`}
                  readOnly
                  className="text-xs border-gray-300 focus:ring-blue-500"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyFormLink(selectedForm.id)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <NextLink href={`/builder/${selectedForm.id}`}>
              <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-100 bg-transparent">
                <Edit className="h-4 w-4 mr-2" /> Edit Form
              </Button>
            </NextLink>
            <NextLink href={`/preview/${selectedForm.id}`} target="_blank">
              <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-100 bg-transparent">
                <Eye className="h-4 w-4 mr-2" /> Preview
              </Button>
            </NextLink>
            <NextLink href={`/forms/${selectedForm.id}/analytics`}>
              <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-100 bg-transparent">
                <BarChart3 className="h-4 w-4 mr-2" /> Analytics
              </Button>
            </NextLink>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormDetailsPanel;