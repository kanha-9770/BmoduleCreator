import React, { useState, useEffect, useRef } from "react";
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
  sections: any[];
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
  // Load initial width from localStorage or default to 240px (~15rem)
  const getInitialWidth = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("module-sidebar-width");
      return saved ? parseInt(saved, 10) : 240;
    }
    return 240;
  };

  const [width, setWidth] = useState(getInitialWidth);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const MIN_WIDTH = 150;
  const MAX_WIDTH = 300;

  // Save width to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("module-sidebar-width", width.toString());
  }, [width]);

  // Handle resizing with mouse
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !sidebarRef.current) return;

      const rect = sidebarRef.current.getBoundingClientRect();
      const newWidth = e.clientX - rect.left;

      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setWidth(newWidth);
      } else if (newWidth < MIN_WIDTH) {
        setWidth(MIN_WIDTH);
      } else if (newWidth > MAX_WIDTH) {
        setWidth(MAX_WIDTH);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.body.style.pointerEvents = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.body.style.pointerEvents = "";
    };
  }, [isResizing]);

  // Render nested modules recursively
  const renderModuleAccordion = (
    modules: FormModule[],
    level = 0
  ): JSX.Element[] => {
    return modules.map((module) => (
      <AccordionItem
        key={module.id}
        value={module.id}
        className="border-b border-gray-200 last:border-b-0"
      >
        <AccordionTrigger
          className={`py-2 pl-${4 + level * 2} pr-2 hover:bg-gray-100 rounded-lg transition-colors duration-200`}
        >
          <div className="flex items-center text-left text-sm font-medium text-gray-700 h-4">
            <FileText className="h-4 w-4 text-gray-500 mr-1 min-w-max" />
            <span className="truncate">{module.name}</span>
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
          <div className="mt-1">
            <div className="flex gap-1">
              <Button
                variant={
                  selectedModule?.id === module.id ? "secondary" : "ghost"
                }
                size="sm"
                className="h-8 flex-1 justify-start text-left text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
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
                className="h-8 hover:bg-gray-100 rounded-lg px-2"
              >
                <FolderPlus className="h-4 w-4 text-gray-500" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openEditDialog(module)}
                title="Edit Module"
                className="h-8 hover:bg-gray-100 rounded-lg px-2"
              >
                <Edit className="h-4 w-4 text-gray-500" />
              </Button>
            </div>

            {/* Render submodules */}
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
    <div
      ref={sidebarRef}
      className="bg-white border-r border-gray-200 shadow-sm flex flex-col relative"
      style={{
        width: `${width}px`,
        minWidth: `${MIN_WIDTH}px`,
        maxWidth: `${MAX_WIDTH}px`,
        transition: isResizing ? "none" : "width 0.2s ease",
      }}
    >
      {/* Resizer Handle */}
      <div
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 transition-colors flex items-center justify-center"
        style={{
          backgroundColor: isResizing ? "#3b82f6" : "transparent",
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsResizing(true);
        }}
      >
        {/* Visual grip lines */}
        <div className="flex flex-col space-y-1 opacity-0 hover:opacity-100 transition-opacity">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-0.5 h-3 bg-gray-400 rounded-full"
            />
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="py-2 px-4 space-y-2 flex-shrink-0">
        <h2 className="text-[1rem] font-medium text-gray-800">Modules</h2>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 border-gray-300 focus:ring-blue-500 text-sm h-8"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="h-8 border-gray-300 text-gray-700 hover:bg-gray-100"
            title={sortOrder === "asc" ? "Sort Z-A" : "Sort A-Z"}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-1 pb-4">
        {filteredModules.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {renderModuleAccordion(filteredModules)}
          </Accordion>
        ) : (
          <div className="text-center text-gray-500 py-8 text-sm">
            No modules found
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleSidebar;