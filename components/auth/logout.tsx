'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function LogoutPage() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Perform logout API call
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        toast.success('Successfully logged out');
        // Redirect to login page or home page
        router.push('/login');
      } else {
        toast.error('Failed to log out');
      }
    } catch (error) {
      toast.error('An error occurred during logout');
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    // Optional: Automatically trigger logout on page load
    // handleLogout();
  }, []);

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Logout</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Are you sure you want to log out?</p>
          <div className="flex space-x-2">
            <Button onClick={handleLogout}>Confirm Logout</Button>
            <Button variant="outline" onClick={() => router.push('/')}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}