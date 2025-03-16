"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Group } from '@/lib/models/group';
import { groupService } from '@/lib/services/group';
import { useAppStore } from '@/app/store/store';
import { useToast } from '@/components/ui/toast-context';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function MembersPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAppStore();
  const { addToast } = useToast();
  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransferringOwnership, setIsTransferringOwnership] = useState(false);
  const [isLeavingGroup, setIsLeavingGroup] = useState(false);
  const groupId = params.groupId as string;

  const isCurrentUserOwner = group?.members.some(
    member => member.userId === user?.id && member.role === 'owner'
  );

  useEffect(() => {
    fetchGroup();
  }, [groupId]);

  const fetchGroup = async () => {
    try {
      setIsLoading(true);
      const groups = await groupService.getMemberGroups();
      const currentGroup = groups.find(g => g._id === groupId);
      if (!currentGroup) {
        addToast({
          title: 'Error',
          description: 'Group not found',
          variant: 'destructive',
        });
        router.push('/home');
        return;
      }
      setGroup(currentGroup);
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to fetch group details',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransferOwnership = async (newOwnerId: string) => {
    try {
      setIsTransferringOwnership(true);
      const updatedGroup = await groupService.transferOwnership(groupId, newOwnerId);
      setGroup(updatedGroup);
      addToast({
        title: 'Success',
        description: 'Group ownership transferred successfully',
      });
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to transfer group ownership',
        variant: 'destructive',
      });
    } finally {
      setIsTransferringOwnership(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!group || isCurrentUserOwner) return;

    try {
      setIsLeavingGroup(true);
      await groupService.leaveGroup(groupId);
      addToast({
        title: 'Success',
        description: 'Left group successfully',
      });
      router.push('/home');
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to leave group',
        variant: 'destructive',
      });
    } finally {
      setIsLeavingGroup(false);
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
        <h1 className="text-xl font-semibold text-gray-100">Group Members</h1>
      </div>

      {/* Members List */}
      <ScrollArea className="flex-1 px-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : group ? (
          <div className="py-4 space-y-4">
            {group.members.map((member) => (
              <div
                key={member.userId}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-800 bg-gray-800/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                    {member.profileImage ? (
                      <img
                        src={member.profileImage}
                        alt={member.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        {member.username[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-100">{member.username}</h3>
                    <p className="text-sm text-gray-400">{member.role}</p>
                  </div>
                </div>
                {member.userId !== user?.id && (
                  <Button
                    onClick={() => handleTransferOwnership(member.userId)}
                    disabled={!isCurrentUserOwner || isTransferringOwnership || member.role === 'owner'}
                    variant="outline"
                    className="bg-gray-700 hover:bg-gray-600"
                  >
                    Make Owner
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : null}
      </ScrollArea>

      {/* Leave Group Button */}
      {group && (
        <div className="p-4 border-t border-gray-800">
          <Button
            onClick={handleLeaveGroup}
            disabled={isCurrentUserOwner || isLeavingGroup}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-900"
          >
            {isLeavingGroup ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Leave Group'
            )}
          </Button>
        </div>
      )}
    </div>
  );
} 