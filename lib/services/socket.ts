import { io, Socket } from 'socket.io-client';
import { useAppStore } from '@/app/store/store';
import { Message } from '@/lib/models/message';
import { TypingEvent } from '@/lib/models/typing';

export interface SocketEvent {
  event: 'joinGroup' | 'leaveGroup' | 'groupMessage' | 'startTyping' | 'stopTyping';
  data: {
    groupId: string;
    message?: Message;
  };
}

class SocketService {
  private socket: Socket | null = null;
  private initialized = false;

  initialize() {
    if (this.initialized) return;

    const token = useAppStore.getState().token;
    if (!token) return;

    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'ws://localhost:3001', {
      extraHeaders: {
        'Auth': `Bearer ${token}`
      }
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.initialized = true;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.initialized = false;
    }
  }

  emit(event: SocketEvent) {
    if (this.socket) {
      this.socket.emit(event.event, event.data);
    }
  }

  onGroupMessage(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('groupMessage', callback);
    }
  }

  offGroupMessage(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.off('groupMessage', callback);
    }
  }

  onUserTyping(callback: (data: TypingEvent) => void) {
    if (this.socket) {
      this.socket.on('userTyping', callback);
    }
  }

  offUserTyping(callback: (data: TypingEvent) => void) {
    if (this.socket) {
      this.socket.off('userTyping', callback);
    }
  }

  onUserStoppedTyping(callback: (data: TypingEvent) => void) {
    if (this.socket) {
      this.socket.on('userStoppedTyping', callback);
    }
  }

  offUserStoppedTyping(callback: (data: TypingEvent) => void) {
    if (this.socket) {
      this.socket.off('userStoppedTyping', callback);
    }
  }

  emitStartTyping(groupId: string) {
    this.emit({
      event: 'startTyping',
      data: { groupId }
    });
  }

  emitStopTyping(groupId: string) {
    this.emit({
      event: 'stopTyping',
      data: { groupId }
    });
  }
}

export const socketService = new SocketService(); 