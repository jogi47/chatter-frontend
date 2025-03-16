export interface GroupMember {
  userId: string;
  username: string;
  profileImage: string | null;
  role: 'owner' | 'member';
}

export interface Group {
  _id: string;
  group_name: string;
  group_image: string;
  members: GroupMember[];
  createdAt: string;
  updatedAt: string;
} 