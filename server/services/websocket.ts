import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import { storage } from "../storage";

interface ConnectedUser {
  userId: string;
  username: string;
  ws: WebSocket;
  rooms: Set<string>;
}

export class WebSocketService {
  private wss: WebSocketServer;
  private connections = new Map<WebSocket, ConnectedUser>();
  private userConnections = new Map<string, Set<WebSocket>>();
  private roomConnections = new Map<string, Set<WebSocket>>();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server, 
      path: '/ws',
      verifyClient: (info) => {
        // Allow all connections in development
        return true;
      }
    });
    this.setupWebSocket();
  }

  private setupWebSocket() {
    this.wss.on('connection', (ws: WebSocket, request) => {
      console.log('New WebSocket connection');

      // Send welcome message
      this.sendMessage(ws, {
        type: 'connection_established',
        data: { message: 'Connected to GamingX WebSocket' }
      });

      ws.on('message', async (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          await this.handleMessage(ws, message);
        } catch (error) {
          console.error('Error handling WebSocket message:', error);
          this.sendError(ws, 'Invalid message format');
        }
      });

      ws.on('close', () => {
        console.log('WebSocket connection closed');
        this.handleDisconnection(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.handleDisconnection(ws);
      });
    });
  }

  private async handleMessage(ws: WebSocket, message: any) {
    const { type, data } = message;

    switch (type) {
      case 'auth':
        await this.handleAuth(ws, data);
        break;
      case 'join_room':
        await this.handleJoinRoom(ws, data);
        break;
      case 'leave_room':
        await this.handleLeaveRoom(ws, data);
        break;
      case 'chat_message':
        await this.handleChatMessage(ws, data);
        break;
      case 'typing_start':
        await this.handleTypingStart(ws, data);
        break;
      case 'typing_stop':
        await this.handleTypingStop(ws, data);
        break;
      default:
        this.sendError(ws, 'Unknown message type');
    }
  }

  private async handleAuth(ws: WebSocket, data: { userId: string; username: string }) {
    const { userId, username } = data;
    
    // Verify user exists
    const user = await storage.getUser(userId);
    if (!user) {
      this.sendError(ws, 'User not found');
      return;
    }

    const connectedUser: ConnectedUser = {
      userId,
      username: user.username || username,
      ws,
      rooms: new Set(),
    };

    this.connections.set(ws, connectedUser);
    
    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, new Set());
    }
    this.userConnections.get(userId)!.add(ws);

    // Join global chat room by default
    await this.joinRoom(ws, 'global');

    this.sendMessage(ws, {
      type: 'auth_success',
      data: { userId, username: connectedUser.username },
    });

    console.log(`User ${username} authenticated`);
  }

  private async handleJoinRoom(ws: WebSocket, data: { roomId: string }) {
    const user = this.connections.get(ws);
    if (!user) {
      this.sendError(ws, 'Not authenticated');
      return;
    }

    await this.joinRoom(ws, data.roomId);
  }

  private async handleLeaveRoom(ws: WebSocket, data: { roomId: string }) {
    const user = this.connections.get(ws);
    if (!user) {
      this.sendError(ws, 'Not authenticated');
      return;
    }

    await this.leaveRoom(ws, data.roomId);
  }

  private async handleChatMessage(ws: WebSocket, data: { roomId: string; content: string }) {
    const user = this.connections.get(ws);
    if (!user) {
      this.sendError(ws, 'Not authenticated');
      return;
    }

    if (!user.rooms.has(data.roomId)) {
      this.sendError(ws, 'Not in room');
      return;
    }

    try {
      // Save message to database
      let roomIdNum: number;
      if (data.roomId === 'global') {
        roomIdNum = 1; // Assume global room has ID 1
      } else {
        roomIdNum = parseInt(data.roomId);
      }

      const message = await storage.sendMessage({
        roomId: roomIdNum,
        userId: user.userId,
        content: data.content,
        messageType: 'text',
      });

      // Broadcast to room members
      this.broadcastToRoom(data.roomId, {
        type: 'chat_message',
        data: {
          id: message.id,
          roomId: data.roomId,
          userId: user.userId,
          username: user.username,
          content: data.content,
          createdAt: message.createdAt,
        },
      });
    } catch (error) {
      console.error('Error saving chat message:', error);
      this.sendError(ws, 'Failed to send message');
    }
  }

  private async handleTypingStart(ws: WebSocket, data: { roomId: string }) {
    const user = this.connections.get(ws);
    if (!user || !user.rooms.has(data.roomId)) return;

    this.broadcastToRoom(data.roomId, {
      type: 'typing_start',
      data: {
        userId: user.userId,
        username: user.username,
        roomId: data.roomId,
      },
    }, ws);
  }

  private async handleTypingStop(ws: WebSocket, data: { roomId: string }) {
    const user = this.connections.get(ws);
    if (!user || !user.rooms.has(data.roomId)) return;

    this.broadcastToRoom(data.roomId, {
      type: 'typing_stop',
      data: {
        userId: user.userId,
        username: user.username,
        roomId: data.roomId,
      },
    }, ws);
  }

  private async joinRoom(ws: WebSocket, roomId: string) {
    const user = this.connections.get(ws);
    if (!user) return;

    user.rooms.add(roomId);

    if (!this.roomConnections.has(roomId)) {
      this.roomConnections.set(roomId, new Set());
    }
    this.roomConnections.get(roomId)!.add(ws);

    this.sendMessage(ws, {
      type: 'joined_room',
      data: { roomId },
    });

    // Notify other room members
    this.broadcastToRoom(roomId, {
      type: 'user_joined',
      data: {
        userId: user.userId,
        username: user.username,
        roomId,
      },
    }, ws);
  }

  private async leaveRoom(ws: WebSocket, roomId: string) {
    const user = this.connections.get(ws);
    if (!user) return;

    user.rooms.delete(roomId);
    this.roomConnections.get(roomId)?.delete(ws);

    this.sendMessage(ws, {
      type: 'left_room',
      data: { roomId },
    });

    // Notify other room members
    this.broadcastToRoom(roomId, {
      type: 'user_left',
      data: {
        userId: user.userId,
        username: user.username,
        roomId,
      },
    }, ws);
  }

  private handleDisconnection(ws: WebSocket) {
    const user = this.connections.get(ws);
    if (user) {
      // Remove from user connections
      const userWs = this.userConnections.get(user.userId);
      if (userWs) {
        userWs.delete(ws);
        if (userWs.size === 0) {
          this.userConnections.delete(user.userId);
        }
      }

      // Remove from room connections
      for (const roomId of user.rooms) {
        this.roomConnections.get(roomId)?.delete(ws);
        
        // Notify room members
        this.broadcastToRoom(roomId, {
          type: 'user_left',
          data: {
            userId: user.userId,
            username: user.username,
            roomId,
          },
        });
      }

      this.connections.delete(ws);
      console.log(`User ${user.username} disconnected`);
    }
  }

  private sendMessage(ws: WebSocket, message: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private sendError(ws: WebSocket, error: string) {
    this.sendMessage(ws, {
      type: 'error',
      data: { error },
    });
  }

  private broadcastToRoom(roomId: string, message: any, exclude?: WebSocket) {
    const roomConnections = this.roomConnections.get(roomId);
    if (!roomConnections) return;

    for (const ws of roomConnections) {
      if (ws !== exclude && ws.readyState === WebSocket.OPEN) {
        this.sendMessage(ws, message);
      }
    }
  }

  // Public methods for other services to use
  public notifyUser(userId: string, message: any) {
    const userConnections = this.userConnections.get(userId);
    if (userConnections) {
      for (const ws of userConnections) {
        this.sendMessage(ws, message);
      }
    }
  }

  public notifyRoom(roomId: string, message: any) {
    this.broadcastToRoom(roomId, message);
  }

  public getConnectedUsers(): { userId: string; username: string }[] {
    return Array.from(this.connections.values()).map(user => ({
      userId: user.userId,
      username: user.username,
    }));
  }

  public isUserOnline(userId: string): boolean {
    return this.userConnections.has(userId);
  }
}

let wsService: WebSocketService | null = null;

export function createWebSocketService(server: Server): WebSocketService {
  wsService = new WebSocketService(server);
  return wsService;
}

export function getWebSocketService(): WebSocketService | null {
  return wsService;
}
