import { User } from '@/lib/models/user';
import { api } from './api';

export const userService = {
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/groups/users/all');
    return response.data;
  },
}; 