export interface User {
  id: string;
  username: string;
  email: string;
  profile_image: string | null;
}

export interface CreateGroupRequest {
  group_name: string;
  member_ids: string;
  group_image?: File;
} 