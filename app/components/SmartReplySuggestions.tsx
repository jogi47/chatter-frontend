"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';

interface SmartReplySuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  isLoading: boolean;
}

export function SmartReplySuggestions({ 
  suggestions, 
  onSuggestionClick,
  isLoading 
}: SmartReplySuggestionsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto border-t border-gray-800 bg-gray-900/30 scrollbar-thin scrollbar-thumb-gray-700">
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Bot size={16} />
          <div>Loading smart replies...</div>
        </div>
      </div>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto border-t border-gray-800 bg-gray-900/30 scrollbar-thin scrollbar-thumb-gray-700">
      <div className="flex items-center gap-2 text-gray-400 text-sm flex-shrink-0">
        <Bot size={16} />
        <div>Smart replies:</div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="bg-gray-800 border-gray-700 text-gray-100 hover:bg-gray-700 whitespace-nowrap flex-shrink-0"
            onClick={() => onSuggestionClick(suggestion)}
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
} 