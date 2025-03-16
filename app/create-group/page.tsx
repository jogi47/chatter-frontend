"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/models/user';
import { userService } from '@/lib/services/user';
import { groupService } from '@/lib/services/group';
import { useAppStore } from '@/app/store/store';
import { useToast } from '@/components/ui/toast-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';

export default function CreateGroupPage() {
  const router = useRouter();
  const { user } = useAppStore();
  const { addToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  const [groupImage, setGroupImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await userService.getAllUsers();
      // Filter out current user
      setUsers(response.filter(u => u.id !== user?.id));
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGroupImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      addToast({
        title: 'Error',
        description: 'Group name is required',
        variant: 'destructive',
      });
      return;
    }

    if (selectedUsers.length === 0) {
      addToast({
        title: 'Error',
        description: 'Please select at least one member',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await groupService.createGroup({
        group_name: groupName.trim(),
        member_ids: selectedUsers.join(','),
        group_image: groupImage || undefined,
      });

      addToast({
        title: 'Success',
        description: 'Group created successfully',
      });
      router.push('/home');
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to create group',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-900">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-800 bg-gray-900/95">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-gray-800"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </button>
        <h1 className="text-xl font-semibold text-gray-100">Create New Group</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 p-4 space-y-6">
        {/* Group Image */}
        <div className="space-y-2">
          <Label className="text-gray-400">Group Image (Optional)</Label>
          <div className="flex items-center justify-center">
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-800">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Group preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full">
                  <Upload className="w-8 h-8 text-gray-500" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Group Name */}
        <div className="space-y-2">
          <Label htmlFor="groupName" className="text-gray-400">Group Name *</Label>
          <Input
            id="groupName"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter group name"
            className="bg-gray-800 border-gray-700 text-gray-100"
            required
          />
        </div>

        {/* Member Selection */}
        <div className="space-y-2">
          <Label className="text-gray-400">Select Members *</Label>
          <div className="border border-gray-800 rounded-lg overflow-hidden">
            <ScrollArea className="h-64">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin" />
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {users.map((user) => (
                    <label
                      key={user.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                          }
                        }}
                        className="w-4 h-4 rounded border-gray-600"
                      />
                      <div className="flex items-center gap-2 flex-1">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                          {user.profile_image ? (
                            <img
                              src={user.profile_image}
                              alt={user.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white">
                              {user.username[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className="text-gray-100">{user.username}</span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting || !groupName.trim() || selectedUsers.length === 0}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            'Create Group'
          )}
        </Button>
      </form>
    </div>
  );
} 