"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Retrieve user data from sessionStorage
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">ERP Dashboard</h1>
            <div className="flex gap-2">
              <Button variant="outline">Export Report</Button>
              <Button>New Transaction</Button>
            </div>
          </div>

        
        </div>
      </main>
    </div>
  );
}
