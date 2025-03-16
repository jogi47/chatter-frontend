import { Group } from '@/lib/models/group';
import { api } from './api';

export const groupService = {
  getMemberGroups: async (): Promise<Group[]> => {
    const response = await api.get<Group[]>('/groups/all-member-groups');
    return response.data;
  },
  
  getOtherGroups: async (): Promise<Group[]> => {
    // For now, using the same endpoint
    const response = await api.get<Group[]>('/groups/not-member-groups');
    return response.data;
  },
}; 