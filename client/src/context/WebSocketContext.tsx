import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

interface WebSocketContextType {
  connectionState: 'connecting' | 'open' | 'closed' | 'error';
  lastMessage: any | null;
  sendMessage: (message: any) => void;
  subscribe: (entityType: string, entityId: number) => void;
  unsubscribe: (entityType: string, entityId: number) => void;
}

const WebSocketContext = createContext<WebSocketContextType>({
  connectionState: 'closed',
  lastMessage: null,
  sendMessage: () => {},
  subscribe: () => {},
  unsubscribe: () => {},
});

interface WebSocketProviderProps {
  userId?: number;
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ 
  userId = 1, // Default to user ID 1 for demo purposes
  children 
}) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connectionState, setConnectionState] = useState<'connecting' | 'open' | 'closed' | 'error'>('closed');
  const [lastMessage, setLastMessage] = useState<any | null>(null);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  
  // Initialize WebSocket connection
  useEffect(() => {
    // Close existing connection if there is one
    if (socket) {
      socket.close();
    }
    
    // Determine WebSocket URL (ws or wss based on page protocol)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/ws`;
    
    console.log(`Connecting to WebSocket at ${wsUrl}`);
    setConnectionState('connecting');
    
    const newSocket = new WebSocket(wsUrl);
    
    // Set up event handlers
    newSocket.onopen = () => {
      console.log('WebSocket connection established');
      setConnectionState('open');
      setReconnectAttempt(0);
      
      // Authenticate after connection is established
      if (userId) {
        newSocket.send(JSON.stringify({
          type: 'authenticate',
          userId
        }));
      }
    };
    
    newSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        setLastMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    newSocket.onclose = () => {
      console.log('WebSocket connection closed');
      setConnectionState('closed');
      
      // Attempt to reconnect after a delay
      if (reconnectAttempt < MAX_RECONNECT_ATTEMPTS) {
        const timeout = Math.min(1000 * Math.pow(2, reconnectAttempt), 30000);
        console.log(`Attempting to reconnect in ${timeout}ms (attempt ${reconnectAttempt + 1}/${MAX_RECONNECT_ATTEMPTS})`);
        
        setTimeout(() => {
          setReconnectAttempt(prev => prev + 1);
        }, timeout);
      }
    };
    
    newSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionState('error');
    };
    
    setSocket(newSocket);
    
    // Clean up on unmount
    return () => {
      if (newSocket) {
        newSocket.close();
      }
    };
  }, [userId, reconnectAttempt]);
  
  // Send a message through the WebSocket
  const sendMessage = useCallback((message: any) => {
    if (socket && connectionState === 'open') {
      socket.send(JSON.stringify(message));
    } else {
      console.warn('Cannot send message - WebSocket not connected');
    }
  }, [socket, connectionState]);
  
  // Subscribe to entity updates
  const subscribe = useCallback((entityType: string, entityId: number) => {
    if (socket && connectionState === 'open') {
      socket.send(JSON.stringify({
        type: 'subscribe',
        entity: entityType,
        entityId
      }));
    } else {
      console.warn(`Cannot subscribe to ${entityType}-${entityId} - WebSocket not connected`);
    }
  }, [socket, connectionState]);
  
  // Unsubscribe from entity updates
  const unsubscribe = useCallback((entityType: string, entityId: number) => {
    if (socket && connectionState === 'open') {
      socket.send(JSON.stringify({
        type: 'unsubscribe',
        entity: entityType,
        entityId
      }));
    }
  }, [socket, connectionState]);
  
  return (
    <WebSocketContext.Provider value={{
      connectionState,
      lastMessage,
      sendMessage,
      subscribe,
      unsubscribe
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Custom hook to use the WebSocket context
export const useWebSocketContext = () => useContext(WebSocketContext);

export default WebSocketContext;