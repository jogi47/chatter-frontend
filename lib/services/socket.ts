import { io, Socket } from 'socket.io-client';
import { useAppStore } from '@/app/store/store';
import { Message } from '@/lib/models/message';
import { TypingEvent } from '@/lib/models/typing';
import { debugSocket } from '@/lib/utils/debug';

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
    if (this.initialized) {
      debugSocket('Socket already initialized, skipping');
      return;
    }

    const token = useAppStore.getState().token;
    if (!token) {
      debugSocket('No token available, skipping socket initialization');
      return;
    }

    debugSocket('Initializing socket connection');
    
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'ws://localhost:3001';
    debugSocket(`Connecting to socket server: ${socketUrl}`);

    this.socket = io(socketUrl, {
      extraHeaders: {
        'Auth': `Bearer ${token}`
      }
    });

    this.socket.on('connect', () => {
      debugSocket('Socket connected successfully');
    });

    this.socket.on('connect_error', (error) => {
      debugSocket('Socket connection error:', error);
    });

    this.socket.on('disconnect', (reason) => {
      debugSocket('Socket disconnected:', reason);
    });

    this.initialized = true;
  }

  disconnect() {
    if (this.socket) {
      debugSocket('Disconnecting socket');
      this.socket.disconnect();
      this.socket = null;
      this.initialized = false;
    }
  }

  emit(event: SocketEvent) {
    if (this.socket) {
      debugSocket(`Emitting event: ${event.event}`, event.data);
      this.socket.emit(event.event, event.data);
    } else {
      debugSocket('Cannot emit event, socket not initialized', event);
    }
  }

  onGroupMessage(callback: (data: any) => void) {
    if (this.socket) {
      debugSocket('Registering groupMessage listener');
      this.socket.on('groupMessage', (data) => {
        debugSocket('Received groupMessage event', data);
        callback(data);
      });
    }
  }

  offGroupMessage(callback: (data: any) => void) {
    if (this.socket) {
      debugSocket('Removing groupMessage listener');
      this.socket.off('groupMessage', callback);
    }
  }

  onUserTyping(callback: (data: TypingEvent) => void) {
    if (this.socket) {
      debugSocket('Registering userTyping listener');
      this.socket.on('userTyping', (data) => {
        debugSocket('Received userTyping event', data);
        callback(data);
      });
    }
  }

  offUserTyping(callback: (data: TypingEvent) => void) {
    if (this.socket) {
      debugSocket('Removing userTyping listener');
      this.socket.off('userTyping', callback);
    }
  }

  onUserStoppedTyping(callback: (data: TypingEvent) => void) {
    if (this.socket) {
      debugSocket('Registering userStoppedTyping listener');
      this.socket.on('userStoppedTyping', (data) => {
        debugSocket('Received userStoppedTyping event', data);
        callback(data);
      });
    }
  }

  offUserStoppedTyping(callback: (data: TypingEvent) => void) {
    if (this.socket) {
      debugSocket('Removing userStoppedTyping listener');
      this.socket.off('userStoppedTyping', callback);
    }
  }

  emitStartTyping(groupId: string) {
    debugSocket('Emitting startTyping event', { groupId });
    this.emit({
      event: 'startTyping',
      data: { groupId }
    });
  }

  emitStopTyping(groupId: string) {
    debugSocket('Emitting stopTyping event', { groupId });
    this.emit({
      event: 'stopTyping',
      data: { groupId }
    });
  }
}

export const socketService = new SocketService(); 