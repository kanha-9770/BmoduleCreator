"use client";
import { usePathname } from "next/navigation";
import { Providers } from "@/components/providers";
import { DynamicSidebar } from "./sidebar";
import { Header } from "./header";
export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Define public/auth routes that should skip the full layout
  const publicRoutes = ["/login", "/register", "/unautherized", "/reset-password"];

  // Render only children (wrapped in Providers) for public routes
  if (publicRoutes.includes(pathname)) {
    return <Providers>{children}</Providers>;
  }

  // Render full layout with sidebar and header for other pages
  return (
    <Providers>
      <div className="flex h-screen bg-gray-50">
        <DynamicSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </Providers>
  );
}
