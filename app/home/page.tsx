"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Group } from '@/lib/models/group';
import { groupService } from '@/lib/services/group';
import { useAppStore } from '@/app/store/store';
import { useToast } from '@/components/ui/toast-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LogOut, Plus } from 'lucide-react';
import { socketService } from '@/lib/services/socket';

export default function HomePage() {
  const router = useRouter();
  const { user, logout } = useAppStore();
  const { addToast } = useToast();
  const [memberGroups, setMemberGroups] = useState<Group[]>([]);
  const [otherGroups, setOtherGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGroups();
    socketService.initialize();
    return () => {
      // socketService.disconnect();
    };
  }, []);

  const fetchGroups = async () => {
    try {
      setIsLoading(true);
      const [memberGroupsData, otherGroupsData] = await Promise.all([
        groupService.getMemberGroups(),
        groupService.getOtherGroups(),
      ]);
      setMemberGroups(memberGroupsData);
      setOtherGroups(otherGroupsData);
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to fetch groups',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleGroupClick = (group: Group) => {
    // Check if the current user is a member of the group
    const isMember = memberGroups.some(g => g._id === group._id);
    
    if (!isMember) {
      addToast({
        title: 'Access Denied',
        description: 'You are not a member of this group',
        variant: 'destructive',
      });
      return;
    }

    socketService.emit({
      event: 'joinGroup',
      data: { groupId: group._id }
    });
    router.push(`/chat/${group._id}`);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-gray-900/75">
        <h1 className="text-xl font-semibold text-gray-100">Groups</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/create-group')}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-800 hover:text-gray-100"
          >
            <Plus className="h-5 w-5" />
          </button>
          <button
            onClick={handleLogout}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-800 hover:text-gray-100"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      <Tabs defaultValue="member" className="flex-1">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
          <TabsTrigger 
            value="member" 
            className="data-[state=active]:bg-gray-700 text-gray-400 data-[state=active]:text-gray-100"
          >
            My Groups
          </TabsTrigger>
          <TabsTrigger 
            value="other" 
            className="data-[state=active]:bg-gray-700 text-gray-400 data-[state=active]:text-gray-100"
          >
            Other Groups
          </TabsTrigger>
        </TabsList>

        <TabsContent value="member" className="flex-1 border-0 bg-transparent outline-none ring-0">
          <ScrollArea className="h-[calc(100vh-8rem)] px-4">
            <div className="space-y-4 py-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="w-8 h-8 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin" />
                </div>
              ) : memberGroups.length > 0 ? (
                memberGroups.map((group) => (
                  <button
                    key={group._id}
                    onClick={() => handleGroupClick(group)}
                    className="w-full p-4 rounded-lg border border-gray-800 bg-gray-800/50 hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <img
                          src={group.group_image}
                          alt={group.group_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-medium text-gray-100">{group.group_name}</h3>
                        <p className="text-sm text-gray-400">{group.members.length} members</p>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center text-gray-400 py-8">
                  No groups found
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="other" className="flex-1 border-0 bg-transparent outline-none ring-0">
          <ScrollArea className="h-[calc(100vh-8rem)] px-4">
            <div className="space-y-4 py-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="w-8 h-8 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin" />
                </div>
              ) : otherGroups.length > 0 ? (
                otherGroups.map((group) => (
                  <button
                    key={group._id}
                    onClick={() => handleGroupClick(group)}
                    className="w-full p-4 rounded-lg border border-gray-800 bg-gray-800/50 hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <img
                          src={group.group_image}
                          alt={group.group_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-medium text-gray-100">{group.group_name}</h3>
                        <p className="text-sm text-gray-400">{group.members.length} members</p>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center text-gray-400 py-8">
                  No other groups available
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
} 