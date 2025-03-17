"use client";

import React from 'react';
import { TypingState } from '@/lib/models/typing';

interface TypingIndicatorProps {
  typingUsers: TypingState;
}

export function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  const typingUsernames = Object.values(typingUsers).map(user => user.username);

  if (typingUsernames.length === 0) {
    return null;
  }

  let text = '';
  if (typingUsernames.length === 1) {
    text = `${typingUsernames[0]} is typing...`;
  } else if (typingUsernames.length === 2) {
    text = `${typingUsernames[0]} and ${typingUsernames[1]} are typing...`;
  } else {
    text = 'Several people are typing...';
  }

  return (
    <div className="px-4 py-2 text-sm text-gray-400 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="flex space-x-1">
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span>{text}</span>
      </div>
    </div>
  );
} 