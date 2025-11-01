"use client";

import { ReactNode, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResizableSidebarProps {
    children: ReactNode;
    defaultWidth?: number;   // Fixed width when expanded
    collapsedWidth?: number;
}

export default function ResizableSidebar({
    children,
    defaultWidth = 288,      // same as your original w-72
    collapsedWidth = 100,     // a bit wider than 48px to fit icons nicely
}: ResizableSidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleCollapse = () => setIsCollapsed((c) => !c);
    const currentWidth = isCollapsed ? collapsedWidth : defaultWidth;

    return (
        <aside
            className="flex-shrink-0 border-r bg-white transition-all duration-200 relative"
            style={{ width: currentWidth }}
        >
            {/* ==== Collapse Button (pinned to top-right) ==== */}
            <div className="absolute top-1 -right-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleCollapse}
                    className="h-8 w-8 rounded-full bg-white shadow-md border border-gray-300 hover:bg-gray-50"
                >
                    {isCollapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <ChevronLeft className="h-4 w-4" />
                    )}
                </Button>
            </div>

            {/* ==== Content (hidden when collapsed) ==== */}
            <div
                className={`h-full overflow-y-auto transition-opacity duration-200 ${isCollapsed
                    ? "opacity-100 pointer-events-none"
                    : "opacity-100"
                    }`}
            >
                {children}
            </div>
        </aside>
    );
}