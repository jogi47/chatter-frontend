import { Group } from '@/lib/models/group';
import { CreateGroupRequest } from '@/lib/models/user';
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

  createGroup: async (data: CreateGroupRequest): Promise<Group> => {
    const formData = new FormData();
    formData.append('group_name', data.group_name);
    formData.append('member_ids', data.member_ids);
    
    if (data.group_image) {
      formData.append('group_image', data.group_image);
    }
    
    const response = await api.post<Group>('/groups/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
}; 