import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowUpDown, FileText, FolderPlus, Edit } from "lucide-react";

interface FormModule {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  children?: FormModule[];
  forms?: Form[];
}

interface Form {
  id: string;
  name: string;
  description?: string;
  moduleId: string;
  isPublished: boolean;
  updatedAt: string;
  sections: any[]; // Adjust as needed
}

interface ModuleSidebarProps {
  filteredModules: FormModule[];
  searchQuery: string;
  sortOrder: "asc" | "desc";
  selectedModule: FormModule | null;
  setSearchQuery: (query: string) => void;
  setSortOrder: (order: "asc" | "desc") => void;
  setSelectedModule: (module: FormModule | null) => void;
  setSelectedForm: (form: Form | null) => void;
  openSubmoduleDialog: (module: FormModule) => void;
  openEditDialog: (module: FormModule) => void;
}

const ModuleSidebar: React.FC<ModuleSidebarProps> = ({
  filteredModules,
  searchQuery,
  sortOrder,
  selectedModule,
  setSearchQuery,
  setSortOrder,
  setSelectedModule,
  setSelectedForm,
  openSubmoduleDialog,
  openEditDialog,
}) => {
  const renderModuleAccordion = (
    modules: FormModule[],
    level = 0
  ): JSX.Element[] => {
    return modules.map((module) => (
      <AccordionItem
        key={module.id}
        value={module.id}
        className="border-b border-gray-200"
      >
        <AccordionTrigger
          className={`py-2 pl-${
            4 + level * 2
          } pr-2 hover:bg-gray-100 rounded-lg transition-colors duration-200`}
        >
          <div className="flex items-center text-left text-sm font-medium text-gray-700">
            <FileText className="h-4 w-4 text-gray-500 text-wrap mr-1 min-w-max" />
            {module.name}
            {(module.forms ?? []).length > 0 && (
              <Badge
                variant="secondary"
                className="ml-1 bg-gray-100 text-gray-600 text-xs"
              >
                {(module.forms ?? []).length}
              </Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="pl-3">
          <div className="mt-1 space-y-2">
            <div className="flex gap-1">
              <Button
                variant={
                  selectedModule?.id === module.id ? "secondary" : "ghost"
                }
                size="sm"
                className="flex-1 justify-start text-left text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                onClick={() => {
                  setSelectedModule(module);
                  setSelectedForm(null);
                }}
              >
                Select Module
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openSubmoduleDialog(module)}
                title="Add Submodule"
                className="hover:bg-gray-100 rounded-lg px-2"
              >
                <FolderPlus className="h-4 w-4 text-gray-500" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openEditDialog(module)}
                title="Edit Module"
                className="hover:bg-gray-100 rounded-lg px-2"
              >
                <Edit className="h-4 w-4 text-gray-500" />
              </Button>
            </div>
            {module.children && module.children.length > 0 && (
              <Accordion type="single" collapsible className="ml-1">
                {renderModuleAccordion(module.children, level + 1)}
              </Accordion>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    ));
  };

  return (
    <div className="w-[15rem] bg-white border-r border-gray-200 shadow-sm flex flex-col">
      <div className="p-4 space-y-4 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-800">Modules</h2>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 border-gray-300 focus:ring-blue-500 text-sm"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
            title={sortOrder === "asc" ? "Sort Z-A" : "Sort A-Z"}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-1 pb-4">
        {filteredModules.length ? (
          <Accordion type="single" collapsible className="w-full">
            {renderModuleAccordion(filteredModules)}
          </Accordion>
        ) : (
          <div className="text-center text-gray-500 py-4">No modules found</div>
        )}
      </div>
    </div>
  );
};

export default ModuleSidebar;
