"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Group } from '@/lib/models/group';
import { groupService } from '@/lib/services/group';
import { useAppStore } from '@/app/store/store';
import { useToast } from '@/components/ui/toast-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LogOut } from 'lucide-react';
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

  const handleGroupClick = (groupId: string) => {
    socketService.emit({
      event: 'joinGroup',
      data: { groupId }
    });
    router.push(`/chat/${groupId}`);
  };

  const GroupCard = ({ group }: { group: Group }) => (
    <div 
      onClick={() => handleGroupClick(group._id)}
      className="flex items-center space-x-4 rounded-lg border border-gray-800/10 bg-gray-900/5 p-4 transition-colors hover:bg-gray-900/10 cursor-pointer"
    >
      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full">
        <img
          src={group.group_image}
          alt={group.group_name}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-100">{group.group_name}</h3>
        <p className="text-sm text-gray-400">{group.members.length} members</p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-gray-900/75">
        <h1 className="text-xl font-semibold text-gray-100">Groups</h1>
        <button
          onClick={handleLogout}
          className="rounded-full p-2 text-gray-400 hover:bg-gray-800 hover:text-gray-100"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <Tabs defaultValue="member" className="h-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
            <TabsTrigger value="member" className="data-[state=active]:bg-gray-700">
              Your Groups
            </TabsTrigger>
            <TabsTrigger value="other" className="data-[state=active]:bg-gray-700">
              Other Groups
            </TabsTrigger>
          </TabsList>

          <TabsContent value="member" className="h-[calc(100vh-8rem)] border-none p-0">
            <ScrollArea className="h-full px-4">
              <div className="space-y-4 py-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-700 border-t-blue-500" />
                  </div>
                ) : memberGroups.length > 0 ? (
                  memberGroups.map((group) => (
                    <GroupCard key={group._id} group={group} />
                  ))
                ) : (
                  <div className="flex items-center justify-center py-8 text-gray-400">
                    No groups found
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="other" className="h-[calc(100vh-8rem)] border-none p-0">
            <ScrollArea className="h-full px-4">
              <div className="space-y-4 py-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-700 border-t-blue-500" />
                  </div>
                ) : otherGroups.length > 0 ? (
                  otherGroups.map((group) => (
                    <GroupCard key={group._id} group={group} />
                  ))
                ) : (
                  <div className="flex items-center justify-center py-8 text-gray-400">
                    No groups found
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 