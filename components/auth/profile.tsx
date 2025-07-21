'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DatabaseService } from '@/lib/database-service';
import { toast } from 'sonner';

interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    status: string;
    lastLogin?: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        department: '',
    });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setIsLoading(true);
                // Assuming you have a way to get the current user ID (e.g., from auth context)
                const userId = 'current-user-id'; // Replace with actual user ID from auth
                const userData = await DatabaseService.getUserById(userId);

                if (userData) {
                    setUser({
                        id: userData.id,
                        name: userData.recordData.name || 'Unknown User',
                        email: userData.recordData.email || '',
                        role: userData.recordData.roleName || 'No Role',
                        department: userData.recordData.department || 'Unassigned',
                        status: userData.status || 'Active',
                        lastLogin: userData.recordData.lastLogin || undefined,
                    });
                    setFormData({
                        name: userData.recordData.name || '',
                        email: userData.recordData.email || '',
                        department: userData.recordData.department || '',
                    });
                }
            } catch (error) {
                toast.error('Failed to load profile');
                console.error('Error fetching user profile:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Check permission for updating profile
            const hasPermission = await DatabaseService.checkUserPermission(
                user!.id,
                'system:user_management'
            );

            if (!hasPermission) {
                toast.error('You do not have permission to update your profile');
                return;
            }

            await DatabaseService.updateUserProfile(user!.id, {
                name: formData.name,
                email: formData.email as string, // Ensure 'email' is allowed in the type
                department: formData.department,
            });

            setUser({
                ...user!,
                name: formData.name,
                email: formData.email,
                department: formData.department,
            });
            setIsEditing(false);
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error('Failed to update profile');
            console.error('Error updating profile:', error);
        }
    };

    const toggleEdit = () => {
        setIsEditing(!isEditing);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <p className="text-center text-red-500">User not found</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">User Profile</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-4 mb-6">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src="/avatar-placeholder.png" alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-xl font-semibold">{user.name}</h2>
                            <p className="text-gray-600">{user.email}</p>
                        </div>
                    </div>

                    {isEditing ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="department">Department</Label>
                                <Input
                                    id="department"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="flex space-x-2">
                                <Button type="submit">Save Changes</Button>
                                <Button type="button" variant="outline" onClick={toggleEdit}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <Label>Role</Label>
                                <p className="text-gray-600">{user.role}</p>
                            </div>
                            <div>
                                <Label>Department</Label>
                                <p className="text-gray-600">{user.department}</p>
                            </div>
                            <div>
                                <Label>Status</Label>
                                <p className="text-gray-600">{user.status}</p>
                            </div>
                            {user.lastLogin && (
                                <div>
                                    <Label>Last Login</Label>
                                    <p className="text-gray-600">
                                        {new Date(user.lastLogin).toLocaleString()}
                                    </p>
                                </div>
                            )}
                            <Button onClick={toggleEdit}>Edit Profile</Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}