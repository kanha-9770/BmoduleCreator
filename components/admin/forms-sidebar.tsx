"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Grid3x3 as Grid3X3, Folder, FolderOpen, FileText, ChevronDown, ChevronRight } from "lucide-react";

interface Form {
  id: string;
  name: string;
  description?: string;
  isEmployeeForm?: boolean;
  isUserForm?: boolean;
  moduleId: string;
}

interface Module {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  level: number;
  forms: Form[];
  children: Module[];
}

interface FormsSidebarProps {
  searchTerm: string;
  onFormSelect: (formId: string, moduleId: string, submoduleId?: string) => void;
  selectedForm: string | null;
}

export function FormsSidebar({
  searchTerm,
  onFormSelect,
  selectedForm,
}: FormsSidebarProps) {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [expandedSubmodules, setExpandedSubmodules] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        console.log("[v0] FormsSidebar: Fetching modules with forms...");
        
        const response = await fetch("/api/modules-permission");
        const result = await response.json();
        
        if (result.success) {
          setModules(result.data);
          console.log("[v0] FormsSidebar: Modules loaded:", result.data);
          
          // Log form counts for debugging
          result.data.forEach((module: any) => {
            console.log(`[v0] FormsSidebar: Module ${module.name} has ${module.forms?.length || 0} forms`);
            module.children?.forEach((child: any) => {
              console.log(`[v0] FormsSidebar: Submodule ${child.name} has ${child.forms?.length || 0} forms`);
            });
          });
        }
      } catch (error) {
        console.error("[v0] FormsSidebar: Error fetching modules:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  // Auto-expand modules/submodules that contain the selected form
  useEffect(() => {
    if (selectedForm && modules.length > 0) {
      const newExpandedModules = new Set(expandedModules);
      const newExpandedSubmodules = new Set(expandedSubmodules);
      
      for (const module of modules) {
        // Check if selected form is in this module
        if (module.forms && module.forms.some(f => f.id === selectedForm)) {
          newExpandedModules.add(module.id);
        }
        
        // Check if selected form is in any submodule
        if (module.children) {
          for (const submodule of module.children) {
            if (submodule.forms && submodule.forms.some(f => f.id === selectedForm)) {
              newExpandedModules.add(module.id);
              newExpandedSubmodules.add(submodule.id);
            }
          }
        }
      }
      
      setExpandedModules(newExpandedModules);
      setExpandedSubmodules(newExpandedSubmodules);
    }
  }, [selectedForm, modules]);

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
      // Also collapse all submodules of this module
      const module = modules.find(m => m.id === moduleId);
      if (module && module.children) {
        const newExpandedSubmodules = new Set(expandedSubmodules);
        module.children.forEach(child => {
          newExpandedSubmodules.delete(child.id);
        });
        setExpandedSubmodules(newExpandedSubmodules);
      }
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const toggleSubmodule = (submoduleId: string) => {
    const newExpanded = new Set(expandedSubmodules);
    if (newExpanded.has(submoduleId)) {
      newExpanded.delete(submoduleId);
    } else {
      newExpanded.add(submoduleId);
    }
    setExpandedSubmodules(newExpanded);
  };

  const filteredModules = modules.filter((module) => {
    if (!searchTerm) return true;
    
    // Check if module name matches
    if (module.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return true;
    }

    // Check if any form in module matches
    if (module.forms && module.forms.some(form => 
      form.name.toLowerCase().includes(searchTerm.toLowerCase())
    )) {
      return true;
    }

    // Check if any submodule or its forms match
    if (module.children) {
      return module.children.some(child => 
        child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (child.forms && child.forms.some(form => 
          form.name.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    }

    return false;
  });

  const getFormTypeIcon = (form: Form) => {
    if (form.isEmployeeForm) return "👥";
    if (form.isUserForm) return "👤";
    return "📄";
  };

  const getTotalFormCount = () => {
    return modules.reduce((total, module) => {
      const moduleForms = module.forms?.length || 0;
      const submoduleForms = module.children?.reduce((subTotal, child) => {
        return subTotal + (child.forms?.length || 0);
      }, 0) || 0;
      return total + moduleForms + submoduleForms;
    }, 0);
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <Grid3X3 className="h-5 w-5" />
            <span>Forms Navigation</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span>Loading forms...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2">
          <Grid3X3 className="h-5 w-5" />
          <span>Forms Navigation</span>
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          {getTotalFormCount()} forms across {modules.length} modules
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[600px] px-4">
          <div className="space-y-2">
            {filteredModules.map((module) => (
              <div key={module.id} className="space-y-1">
                <Collapsible
                  open={expandedModules.has(module.id)}
                  onOpenChange={() => toggleModule(module.id)}
                >
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted cursor-pointer w-full text-left">
                      {expandedModules.has(module.id) ? (
                        <>
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          <FolderOpen className="h-4 w-4 text-blue-600" />
                        </>
                      ) : (
                        <>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          <Folder className="h-4 w-4 text-blue-600" />
                        </>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {module.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {module.description}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {module.forms && module.forms.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {module.forms.length}
                          </Badge>
                        )}
                        {module.children && module.children.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {module.children.length}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="ml-6 space-y-1">
                    {/* Module-level forms */}
                    {module.forms && module.forms.length > 0 && (
                      <div className="space-y-1">
                        {module.forms
                          .filter(form => !searchTerm || 
                            form.name.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map((form) => (
                            <div
                              key={form.id}
                              className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
                                selectedForm === form.id
                                  ? "bg-primary/10 border border-primary/20"
                                  : "hover:bg-muted"
                              }`}
                              onClick={() => onFormSelect(form.id, module.id)}
                            >
                              <FileText className="h-4 w-4 text-green-600" />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">
                                  {form.name}
                                </div>
                                {form.description && (
                                  <div className="text-xs text-muted-foreground truncate">
                                    {form.description}
                                  </div>
                                )}
                              </div>
                              <span className="text-xs">{getFormTypeIcon(form)}</span>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Submodules */}
                    {module.children && module.children.map((submodule) => (
                      <div key={submodule.id} className="space-y-1">
                        <Collapsible
                          open={expandedSubmodules.has(submodule.id)}
                          onOpenChange={() => toggleSubmodule(submodule.id)}
                        >
                          <CollapsibleTrigger asChild>
                            <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted cursor-pointer w-full text-left">
                              {expandedSubmodules.has(submodule.id) ? (
                                <>
                                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                  <FolderOpen className="h-3 w-3 text-purple-600" />
                                </>
                              ) : (
                                <>
                                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                  <Folder className="h-3 w-3 text-purple-600" />
                                </>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">
                                  {submodule.name}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {submodule.description}
                                </div>
                              </div>
                              {submodule.forms && submodule.forms.length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {submodule.forms.length}
                                </Badge>
                              )}
                            </div>
                          </CollapsibleTrigger>

                          <CollapsibleContent className="ml-6 space-y-1">
                            {/* Submodule forms */}
                            {submodule.forms && submodule.forms.length > 0 && (
                              <div className="space-y-1">
                                {submodule.forms
                                  .filter(form => !searchTerm || 
                                    form.name.toLowerCase().includes(searchTerm.toLowerCase())
                                  )
                                  .map((form) => (
                                    <div
                                      key={form.id}
                                      className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
                                        selectedForm === form.id
                                          ? "bg-primary/10 border border-primary/20"
                                          : "hover:bg-muted"
                                      }`}
                                      onClick={() => onFormSelect(form.id, module.id, submodule.id)}
                                    >
                                      <FileText className="h-4 w-4 text-green-600" />
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm truncate">
                                          {form.name}
                                        </div>
                                        {form.description && (
                                          <div className="text-xs text-muted-foreground truncate">
                                            {form.description}
                                          </div>
                                        )}
                                      </div>
                                      <span className="text-xs">{getFormTypeIcon(form)}</span>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            ))}

            {filteredModules.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Grid3X3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">
                  No forms found matching "{searchTerm}"
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}