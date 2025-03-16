import { Message, SendMessageRequest, SendMessageResponse } from '@/lib/models/message';
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
}; 