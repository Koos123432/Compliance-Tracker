
import { WebSocketServer } from 'ws';

// Client tracking
const clients = new Map();

// WebSocket server setup 
export function setupWebSocketServer(server) {
  const wss = new WebSocketServer({ server, path: '/ws' });
  
  console.log('WebSocket server initialized at /ws');
  
  wss.on('connection', (socket) => {
    console.log('New WebSocket connection established');
    
    // Initialize client data
    const client = {
      userId: 0, // Will be set after authentication
      socket,
      subscriptions: new Set()
    };
    
    // Store client in our map
    clients.set(socket, client);
    
    // Handle messages from client
    socket.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received WebSocket message:', data);
        handleClientMessage(client, data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    // Handle client disconnection
    socket.on('close', () => {
      console.log('WebSocket connection closed');
      clients.delete(socket);
    });
    
    // Handle errors
    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(socket);
    });
    
    // Send a welcome message
    socket.send(JSON.stringify({
      type: 'info',
      message: 'Connected to compliance management system'
    }));
  });
  
  return wss;
}

// Handle messages from clients
function handleClientMessage(client, message) {
  switch (message.type) {
    case 'authenticate':
      authenticateClient(client, message.userId);
      break;
      
    case 'subscribe':
      subscribeToEntity(client, message.entity, message.entityId);
      break;
      
    case 'unsubscribe':
      unsubscribeFromEntity(client, message.entity, message.entityId);
      break;
      
    case 'status':
      // Send back the client's current subscriptions
      client.socket.send(JSON.stringify({
        type: 'status',
        userId: client.userId,
        subscriptions: Array.from(client.subscriptions)
      }));
      break;
      
    default:
      console.warn(`Unknown WebSocket message type: ${message.type}`);
      client.socket.send(JSON.stringify({
        type: 'error',
        message: `Unknown message type: ${message.type}`
      }));
  }
}

// Authenticate a client with a user ID
function authenticateClient(client, userId) {
  client.userId = userId;
  console.log(`Client authenticated as user ${userId}`);
  
  // Notify the client of successful authentication
  client.socket.send(JSON.stringify({
    type: 'authenticated',
    userId
  }));
}

// Subscribe a client to entity updates
function subscribeToEntity(client, entityType, entityId) {
  const subscriptionKey = `${entityType}-${entityId}`;
  client.subscriptions.add(subscriptionKey);
  
  console.log(`User ${client.userId} subscribed to ${subscriptionKey}`);
  
  // Confirm subscription to client
  client.socket.send(JSON.stringify({
    type: 'subscribed',
    entity: entityType,
    entityId
  }));
}

// Unsubscribe a client from entity updates
function unsubscribeFromEntity(client, entityType, entityId) {
  const subscriptionKey = `${entityType}-${entityId}`;
  client.subscriptions.delete(subscriptionKey);
  
  console.log(`User ${client.userId} unsubscribed from ${subscriptionKey}`);
  
  // Confirm unsubscription to client
  client.socket.send(JSON.stringify({
    type: 'unsubscribed',
    entity: entityType,
    entityId
  }));
}

// Broadcast a message to all clients subscribed to an entity
export function broadcastMessage(message) {
  if (!message.entity || !message.entityId) {
    console.error('Invalid broadcast message, missing entity or entityId:', message);
    return;
  }
  
  broadcastMessageToClients(message);
}

// Internal function to broadcast messages to appropriate clients
function broadcastMessageToClients(message) {
  const subscriptionKey = `${message.entity}-${message.entityId}`;
  let recipientCount = 0;
  
  // Broadcast to all clients subscribed to this entity
  clients.forEach((client) => {
    if (client.subscriptions.has(subscriptionKey) && client.socket.readyState === WebSocket.OPEN) {
      client.socket.send(JSON.stringify(message));
      recipientCount++;
    }
  });
  
  console.log(`Broadcast message to ${recipientCount} clients for ${subscriptionKey}`);
}

// Send a direct message to a specific user
export function sendDirectMessage(userId, message) {
  let sent = false;
  
  clients.forEach((client) => {
    if (client.userId === userId && client.socket.readyState === WebSocket.OPEN) {
      client.socket.send(JSON.stringify(message));
      sent = true;
    }
  });
  
  return sent;
}

// Clean up all connections (used during shutdown)
export function closeAllConnections() {
  clients.forEach((client, socket) => {
    try {
      socket.close();
    } catch (error) {
      console.error('Error closing WebSocket connection:', error);
    }
  });
  
  clients.clear();
  console.log('All WebSocket connections closed');
}
