"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/app/store/store';

export default function HomePage() {
  const router = useRouter();
  const { user, logout } = useAppStore();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="p-4">
      <div className="mb-6 rounded-lg border p-4 shadow-sm">
        <h1 className="text-2xl font-bold">Welcome to the Home Page</h1>
        <p className="mt-2 text-gray-600">You are now logged in!</p>
      </div>

      {user && (
        <div className="mb-6 rounded-lg border p-4 shadow-sm">
          <h2 className="text-xl font-semibold">User Profile</h2>
          <div className="mt-4 space-y-2">
            <p><span className="font-medium">Username:</span> {user.username}</p>
            <p><span className="font-medium">Email:</span> {user.email}</p>
            {user.profile_image && (
              <div>
                <p className="font-medium">Profile Image:</p>
                <div className="mt-2 h-20 w-20 overflow-hidden rounded-full">
                  <img 
                    src={user.profile_image} 
                    alt={`${user.username}'s profile`} 
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Button onClick={handleLogout} variant="outline">
        Logout
      </Button>
    </div>
  );
} 