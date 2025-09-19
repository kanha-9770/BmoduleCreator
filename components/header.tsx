"use client";

import { useState, useEffect } from "react";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  name: string;
  email: string;
  email_verified?: boolean;
  status: string;
  createdAt: string;
}

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    console.log("Header component mounted, checking user data");

    const fetchUser = async () => {
      console.log("Fetching user data from /api/auth/me");
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include", // Include cookies for auth-token
        });
        console.log("User fetch response status:", response.status);
        const result = await response.json();
        console.log("User fetch result:", result);

        if (!response.ok) {
          console.log("User fetch failed, redirecting to login");
          toast({
            title: "Error",
            description: "Failed to load user data",
            variant: "destructive",
          });
          sessionStorage.removeItem("user"); // Clear invalid sessionStorage
          router.push("/login");
          return;
        }

        console.log("User data loaded successfully:", result.user);
        // Store user data in sessionStorage
        sessionStorage.setItem("user", JSON.stringify(result.user));
        setUser(result.user);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive",
        });
        sessionStorage.removeItem("user"); // Clear invalid sessionStorage
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    // Check if user data is already in sessionStorage
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("Found valid user data in sessionStorage:", parsedUser);
        setUser(parsedUser);
        setIsLoading(false);
      } catch (error) {
        console.error("Error parsing sessionStorage user data:", error);
        console.log(
          "Invalid user data in sessionStorage, clearing and fetching new data"
        );
        sessionStorage.removeItem("user"); // Clear invalid data
        fetchUser();
      }
    } else {
      console.log("No user data in sessionStorage, fetching from API");
      fetchUser();
    }
  }, [router, toast]);

  const handleLogout = async () => {
    console.log("Initiating logout");
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include", // Include cookies for auth-token
      });

      if (response.ok) {
        console.log("Logout successful");
        // Clear user data from sessionStorage
        sessionStorage.removeItem("user");
        // Clear auth-token cookie
        document.cookie = "auth-token=; path=/; max-age=0"; // Expire the cookie immediately
        toast({
          title: "Logged out",
          description: "You have been successfully logged out",
        });
        router.push("/login");
      } else {
        throw new Error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Fallbacks for display if user data is not available
  const displayName = user?.name || "Guest";
  const displayEmail = user?.email || "No email provided";
  const avatarFallback = user?.name?.[0] || "JD";

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search orders, products, customers..."
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full"
                disabled={isLoading}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-user.jpg" alt="User" />
                  <AvatarFallback>{avatarFallback}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {displayName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {displayEmail}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/profile">
                <DropdownMenuItem className="cursor-pointer">
                  Profile
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer"
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
