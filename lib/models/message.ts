export interface Message {
  _id: string;
  group_id: string;
  user_id: string;
  username: string;
  user_profile_image: string | null;
  type: 'text' | 'image';
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageRequest {
  group_id: string;
  content: string;
}

export interface SendMessageResponse extends Message {} 