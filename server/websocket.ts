import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';

interface WSMessage {
  type: string;
  entity?: string;
  entityId?: number;
  action?: string;
  data?: any;
  userId?: number;
  userName?: string;
  timestamp?: number;
  message?: string;
  id?: string;
}

interface WSClient {
  socket: WebSocket;
  userId: number;
  subscriptions: Set<string>;
}

export default function setupWebSocketServer(httpServer: HttpServer) {
  // Create WebSocket server with custom path - use a more distinct path to avoid conflicts
  const wss = new WebSocketServer({ server: httpServer, path: '/api/ws' });
  
  // Store connected clients and their subscriptions
  const clients = new Map<WebSocket, WSClient>();
  
  // Store message history for each entity
  const messageHistory = new Map<string, WSMessage[]>();
  
  // Function to get a key for entity + id combination
  const getEntityKey = (entity: string, id: number): string => `${entity}:${id}`;
  
  // Function to broadcast a message to all subscribed clients
  const broadcastToEntity = (entityKey: string, message: WSMessage) => {
    // Add message to history if it's a chat message
    if (message.type === 'chat') {
      if (!messageHistory.has(entityKey)) {
        messageHistory.set(entityKey, []);
      }
      
      const history = messageHistory.get(entityKey)!;
      // Keep only the last 100 messages
      if (history.length >= 100) {
        history.shift();
      }
      history.push(message);
    }
    
    // Broadcast to all clients subscribed to this entity
    clients.forEach((client) => {
      if (client.subscriptions.has(entityKey) && client.socket.readyState === WebSocket.OPEN) {
        client.socket.send(JSON.stringify(message));
      }
    });
  };
  
  // Function to get active users for an entity
  const getActiveUsersForEntity = (entityKey: string): any[] => {
    const activeUsers: any[] = [];
    clients.forEach((client) => {
      if (client.subscriptions.has(entityKey)) {
        activeUsers.push({
          userId: client.userId,
          userName: `User ${client.userId}`, // In a real app, fetch user details
          joinedAt: Date.now()
        });
      }
    });
    return activeUsers;
  };
  
  // Handle new connections
  wss.on('connection', (socket) => {
    console.log('WebSocket client connected');
    
    // Create a new client entry with default values
    const client: WSClient = {
      socket,
      userId: 0, // Will be set on auth message
      subscriptions: new Set()
    };
    
    clients.set(socket, client);
    
    // Handle client messages
    socket.on('message', (data) => {
      try {
        const message: WSMessage = JSON.parse(data.toString());
        message.id = message.id || uuidv4();
        message.timestamp = message.timestamp || Date.now();
        
        // Handle different message types
        switch (message.type) {
          case 'auth':
            // Authenticate the client
            client.userId = message.userId || 0;
            console.log(`Client authenticated with userId: ${client.userId}`);
            break;
            
          case 'subscribe':
            // Client subscribes to an entity's updates
            if (message.entity && message.entityId !== undefined) {
              const entityKey = getEntityKey(message.entity, message.entityId);
              client.subscriptions.add(entityKey);
              console.log(`Client ${client.userId} subscribed to ${entityKey}`);
              
              // Send message history for this entity
              if (messageHistory.has(entityKey)) {
                socket.send(JSON.stringify({
                  type: 'history',
                  entity: message.entity,
                  entityId: message.entityId,
                  data: messageHistory.get(entityKey),
                  timestamp: Date.now()
                }));
              }
              
              // Send active users list
              socket.send(JSON.stringify({
                type: 'users',
                entity: message.entity,
                entityId: message.entityId,
                data: getActiveUsersForEntity(entityKey),
                timestamp: Date.now()
              }));
            }
            break;
            
          case 'unsubscribe':
            // Client unsubscribes from an entity's updates
            if (message.entity && message.entityId !== undefined) {
              const entityKey = getEntityKey(message.entity, message.entityId);
              client.subscriptions.delete(entityKey);
              console.log(`Client ${client.userId} unsubscribed from ${entityKey}`);
            }
            break;
            
          case 'chat':
            // Handle chat message for an entity
            if (message.entity && message.entityId !== undefined) {
              const entityKey = getEntityKey(message.entity, message.entityId);
              message.userName = message.userName || `User ${client.userId}`;
              broadcastToEntity(entityKey, message);
            }
            break;
            
          case 'presence':
            // Handle presence updates (join/leave)
            if (message.entity && message.entityId !== undefined && message.action) {
              const entityKey = getEntityKey(message.entity, message.entityId);
              message.userName = message.userName || `User ${client.userId}`;
              broadcastToEntity(entityKey, message);
            }
            break;
            
          case 'broadcast':
            // Broadcast an update for an entity
            if (message.entity && message.entityId !== undefined && message.action) {
              const entityKey = getEntityKey(message.entity, message.entityId);
              broadcastToEntity(entityKey, message);
            }
            break;
            
          default:
            console.log(`Unknown message type: ${message.type}`);
        }
        
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });
    
    // Handle disconnection
    socket.on('close', () => {
      const client = clients.get(socket);
      if (client) {
        // Notify all subscribed entities about the client leaving
        client.subscriptions.forEach((entityKey) => {
          const [entity, idStr] = entityKey.split(':');
          const entityId = parseInt(idStr);
          
          broadcastToEntity(entityKey, {
            type: 'presence',
            action: 'leave',
            entity,
            entityId,
            userId: client.userId,
            userName: `User ${client.userId}`,
            timestamp: Date.now()
          });
        });
        
        clients.delete(socket);
        console.log(`WebSocket client disconnected (userId: ${client.userId})`);
      }
    });
  });
  
  return wss;
}