export interface TypingEvent {
  groupId: string;
  userId: string;
  username: string;
}

export interface TypingState {
  [userId: string]: {
    username: string;
    timestamp: number;
  };
} 