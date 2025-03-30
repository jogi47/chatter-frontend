"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Message } from '@/lib/models/message';
import { Group } from '@/lib/models/group';
import { messageService } from '@/lib/services/message';
import { groupService } from '@/lib/services/group';
import { useAppStore } from '@/app/store/store';
import { useToast } from '@/components/ui/toast-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Send } from 'lucide-react';
import { format } from 'date-fns';
import { socketService } from '@/lib/services/socket';
import { TypingIndicator } from '@/app/components/TypingIndicator';
import { TypingEvent, TypingState } from '@/lib/models/typing';
import { debounce } from 'lodash';
import { SmartReplySuggestions } from '@/app/components/SmartReplySuggestions';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAppStore();
  const { addToast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [group, setGroup] = useState<Group | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const groupId = params.groupId as string;
  const [typingUsers, setTypingUsers] = useState<TypingState>({});
  const [smartReplies, setSmartReplies] = useState<string[]>([]);
  const [isLoadingSmartReplies, setIsLoadingSmartReplies] = useState(false);

  const debouncedStopTyping = useRef(
    debounce((groupId: string) => {
      socketService.emitStopTyping(groupId);
    }, 1000)
  ).current;

  useEffect(() => {
    fetchGroupAndMessages();
  }, [groupId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Handle incoming messages
    const handleGroupMessage = (data: any) => {
      if (data.groupId === groupId && data.message.user_id !== user?.id) {
        console.log(`${data.message} beingcalled....`);
        setMessages(prev => [...prev, data.message]);
      }
    };
    socketService.onGroupMessage(handleGroupMessage);

    // Cleanup function
    return () => {
      socketService.offGroupMessage(handleGroupMessage);
      
      // Only emit leaveGroup if we're actually leaving the page
      // not just when the effect re-runs
      if (typeof window !== 'undefined' && window.location.pathname !== `/chat/${groupId}`) {
        socketService.emit({
          event: 'leaveGroup',
          data: { groupId }
        });
      }
    };
  }, [groupId, user?.id]); // Add user?.id as dependency

  useEffect(() => {
    const handleUserTyping = (data: TypingEvent) => {
      if (data.groupId === groupId && data.userId !== user?.id) {
        setTypingUsers(prev => ({
          ...prev,
          [data.userId]: {
            username: data.username,
            timestamp: Date.now()
          }
        }));
      }
    };

    const handleUserStoppedTyping = (data: TypingEvent) => {
      if (data.groupId === groupId && data.userId !== user?.id) {
        setTypingUsers(prev => {
          const newState = { ...prev };
          delete newState[data.userId];
          return newState;
        });
      }
    };

    socketService.onUserTyping(handleUserTyping);
    socketService.onUserStoppedTyping(handleUserStoppedTyping);

    // Cleanup typing indicators older than 3 seconds
    const cleanupInterval = setInterval(() => {
      setTypingUsers(prev => {
        const now = Date.now();
        const newState = { ...prev };
        Object.entries(newState).forEach(([userId, data]) => {
          if (now - data.timestamp > 3000) {
            delete newState[userId];
          }
        });
        return newState;
      });
    }, 1000);

    return () => {
      socketService.offUserTyping(handleUserTyping);
      socketService.offUserStoppedTyping(handleUserStoppedTyping);
      clearInterval(cleanupInterval);
    };
  }, [groupId, user?.id]);

  useEffect(() => {
    if (messages.length > 0) {
      fetchSmartReplies();
    }
  }, [messages.length, groupId]);

  const fetchGroupAndMessages = async () => {
    try {
      setIsLoading(true);
      const [groupData, messagesData] = await Promise.all([
        groupService.getMemberGroups().then(groups => 
          groups.find(g => g._id === groupId)
        ),
        messageService.getGroupMessages(groupId),
      ]);

      if (!groupData) {
        addToast({
          title: 'Error',
          description: 'Group not found',
          variant: 'destructive',
        });
        router.push('/home');
        return;
      }

      setGroup(groupData);
      setMessages(messagesData);
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to load chat',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);
    
    if (value.length > 0) {
      socketService.emitStartTyping(groupId);
      debouncedStopTyping(groupId);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    try {
      setIsSending(true);
      
      // Send message through REST API
      const response = await messageService.sendTextMessage({
        group_id: groupId,
        content: newMessage.trim(),
      });

      // Emit socket event
      socketService.emit({
        event: 'groupMessage',
        data: {
          groupId,
          message: response,
        }
      });

      setMessages(prev => [...prev, response]);
      setNewMessage('');
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const fetchSmartReplies = async () => {
    console.log('fetching smart replies');
    if (!groupId) return;
    console.log(`Got group id and calling it: ${groupId}`);
    try {
      setIsLoadingSmartReplies(true);
      const suggestions = await messageService.getSmartReplies(groupId);
      setSmartReplies(suggestions);
      console.log('Smart replies:', suggestions);
    } catch (error) {
      console.error('Failed to fetch smart replies:', error);
    } finally {
      setIsLoadingSmartReplies(false);
    }
  };

  const handleSmartReplyClick = (suggestion: string) => {
    setNewMessage(suggestion);
    // Optional: Auto-send the message
    // setTimeout(() => {
    //   handleSendMessage(new Event('submit') as React.FormEvent);
    // }, 100);
  };

  const MessageBubble = ({ message }: { message: Message }) => {
    const isCurrentUser = message.user_id === user?.id;
    const time = format(new Date(message.createdAt), 'HH:mm');

    return (
      <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 max-w-[80%]`}>
          {!isCurrentUser && (
            <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden">
              {message.user_profile_image ? (
                <img
                  src={message.user_profile_image}
                  alt={message.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center text-white text-sm">
                  {message.username[0].toUpperCase()}
                </div>
              )}
            </div>
          )}
          <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
            {!isCurrentUser && (
              <span className="text-xs text-gray-400 mb-1">{message.username}</span>
            )}
            <div
              className={`rounded-2xl px-4 py-2 max-w-full break-words ${
                isCurrentUser
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-100'
              }`}
            >
              {message.type === 'image' ? (
                <img
                  src={message.content}
                  alt="Message attachment"
                  className="max-w-[200px] rounded-lg"
                />
              ) : (
                <p>{message.content}</p>
              )}
            </div>
            <span className="text-xs text-gray-500 mt-1">{time}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-800 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/75">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-gray-800"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </button>
        {group && (
          <div className="flex items-center justify-between flex-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img
                  src={group.group_image}
                  alt={group.group_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="font-semibold text-gray-100">{group.group_name}</h1>
                <p className="text-sm text-gray-400">
                  {group.members.length} members
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push(`/chat/${groupId}/members`)}
              className="px-4 py-2 rounded-lg bg-gray-800 text-gray-100 hover:bg-gray-700 transition-colors"
            >
              Members
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble key={message._id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      <SmartReplySuggestions 
        suggestions={smartReplies}
        onSuggestionClick={handleSmartReplyClick}
        isLoading={isLoadingSmartReplies}
      />

      {/* Typing Indicator */}
      <TypingIndicator typingUsers={typingUsers} />

      {/* Message Input */}
      <form
        onSubmit={handleSendMessage}
        className="flex items-center gap-2 p-4 border-t border-gray-800 bg-gray-900/95"
      >
        <Input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={handleMessageChange}
          className="flex-1 bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!newMessage.trim() || isSending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Send className="w-5 h-5" />
        </Button>
      </form>
    </div>
  );
} 