import { useEffect, useRef, useState } from "react";
import { useAuth } from "./useAuth";

interface WebSocketMessage {
  type: string;
  data: any;
}

interface UseWebSocketReturn {
  socket: WebSocket | null;
  isConnected: boolean;
  sendMessage: (message: WebSocketMessage) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
}

export function useWebSocket(): UseWebSocketReturn {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const connect = () => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      console.log('Connecting to WebSocket:', wsUrl);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectAttempts.current = 0;
        
        // Authenticate with the server
        ws.send(JSON.stringify({
          type: 'auth',
          data: {
            userId: user.id,
            username: user.username || user.firstName || 'Anonymous'
          }
        }));
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setSocket(null);
        
        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})`);
          setTimeout(connect, 1000 * reconnectAttempts.current);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      setSocket(ws);
    };

    connect();

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [isAuthenticated, user]);

  const handleMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'connection_established':
        console.log('WebSocket connected');
        setIsConnected(true);
        break;
      case 'auth_success':
        console.log('WebSocket authentication successful');
        break;
      case 'error':
        console.error('WebSocket error:', message.data?.error || 'Unknown error');
        break;
      case 'chat_message':
        // Dispatch custom event for chat components
        window.dispatchEvent(new CustomEvent('websocket-chat-message', { detail: message.data }));
        break;
      case 'notification':
        // Dispatch custom event for notification handling
        window.dispatchEvent(new CustomEvent('websocket-notification', { detail: message.data }));
        break;
      case 'user_joined':
      case 'user_left':
      case 'joined_room':
        // Handle room events
        window.dispatchEvent(new CustomEvent('websocket-room-event', { detail: message }));
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  };

  const sendMessage = (message: WebSocketMessage) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket not connected');
    }
  };

  const joinRoom = (roomId: string) => {
    sendMessage({
      type: 'join_room',
      data: { roomId }
    });
  };

  const leaveRoom = (roomId: string) => {
    sendMessage({
      type: 'leave_room',
      data: { roomId }
    });
  };

  return {
    socket,
    isConnected,
    sendMessage,
    joinRoom,
    leaveRoom
  };
}
