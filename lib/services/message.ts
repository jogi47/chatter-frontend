import { Message, SendMessageRequest, SendMessageResponse } from '@/lib/models/message';
import { SmartReplyRequest, SmartReplyResponse } from '@/lib/models/smartReply';
import { api } from './api';

export const messageService = {
  getGroupMessages: async (groupId: string): Promise<Message[]> => {
    const response = await api.get<Message[]>(`/messages/group/${groupId}`);
    return response.data;
  },

  sendTextMessage: async (data: SendMessageRequest): Promise<SendMessageResponse> => {
    const response = await api.post<SendMessageResponse>('/messages/text', data);
    return response.data;
  },

  getSmartReplies: async (groupId: string): Promise<string[]> => {
    const response = await api.post<SmartReplyResponse>('/messages/smart-replies', {
      group_id: groupId
    });
    return response.data.suggestions;
  }
}; 