import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { ConnectionState, WSMessage } from '@/hooks/useWebSocket';

interface WebSocketContextType {
  connectionState: ConnectionState;
  lastMessage: WSMessage | null;
  sendMessage: (message: WSMessage) => void;
  subscribeToEntity: (entityType: string, entityId: number) => void;
  unsubscribeFromEntity: (entityType: string, entityId: number) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [connectionState, setConnectionState] = useState<ConnectionState>('connecting');
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  
  // Initialize WebSocket connection
  const connectWebSocket = useCallback(() => {
    if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }
    
    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/ws`;
      
      setConnectionState('connecting');
      
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      
      socket.onopen = () => {
        setConnectionState('open');
        console.log('WebSocket connection established');
      };
      
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WSMessage;
          setLastMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      socket.onclose = () => {
        setConnectionState('closed');
        console.log('WebSocket connection closed');
        
        // Set up reconnection
        reconnectTimeoutRef.current = window.setTimeout(() => {
          console.log('Attempting to reconnect WebSocket...');
          connectWebSocket();
        }, 5000); // Try to reconnect after 5 seconds
      };
      
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionState('closed');
        
        // Force close the socket on error to trigger the reconnection logic
        socket.close();
      };
      
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      setConnectionState('closed');
      
      // Set up reconnection
      reconnectTimeoutRef.current = window.setTimeout(() => {
        console.log('Attempting to reconnect WebSocket after error...');
        connectWebSocket();
      }, 5000);
    }
  }, []);
  
  // Connect on component mount and cleanup on unmount
  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (socketRef.current) {
        setConnectionState('closing');
        socketRef.current.close();
      }
      
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connectWebSocket]);
  
  // Send a message through the WebSocket
  const sendMessage = useCallback((message: WSMessage) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      console.warn('Cannot send message, WebSocket is not connected');
    }
  }, []);
  
  // Subscribe to entity updates
  const subscribeToEntity = useCallback((entityType: string, entityId: number) => {
    sendMessage({
      type: 'subscribe',
      entity: entityType,
      entityId,
    });
  }, [sendMessage]);
  
  // Unsubscribe from entity updates
  const unsubscribeFromEntity = useCallback((entityType: string, entityId: number) => {
    sendMessage({
      type: 'unsubscribe',
      entity: entityType,
      entityId,
    });
  }, [sendMessage]);
  
  // Context value
  const value = {
    connectionState,
    lastMessage,
    sendMessage,
    subscribeToEntity,
    unsubscribeFromEntity,
  };
  
  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};