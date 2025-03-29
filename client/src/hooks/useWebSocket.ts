import { useState, useEffect, useCallback, useRef } from 'react';

export type ConnectionState = 'connecting' | 'open' | 'closing' | 'closed';

export interface WSMessage {
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

/**
 * Custom hook for managing WebSocket connections
 * 
 * @param userId - The user's ID
 * @returns Connection state, last message, and functions to interact with the WebSocket
 */
export default function useWebSocket(userId: number) {
  const [connectionState, setConnectionState] = useState<ConnectionState>('connecting');
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const subscriptionRef = useRef<Set<string>>(new Set());
  
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
        
        // Resubscribe to any active subscriptions
        subscriptionRef.current.forEach(key => {
          const [entityType, entityId] = key.split(':');
          sendMessage({
            type: 'subscribe',
            entity: entityType,
            entityId: parseInt(entityId),
            userId,
          });
        });
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
  }, [userId]);
  
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
      // Add user ID and timestamp if not already provided
      const completeMessage = {
        ...message,
        userId: message.userId ?? userId,
        timestamp: message.timestamp ?? Date.now(),
      };
      
      socketRef.current.send(JSON.stringify(completeMessage));
    } else {
      console.warn('Cannot send message, WebSocket is not connected');
    }
  }, [userId]);
  
  // Subscribe to entity updates
  const subscribeToEntity = useCallback((entityType: string, entityId: number) => {
    const key = `${entityType}:${entityId}`;
    subscriptionRef.current.add(key);
    
    sendMessage({
      type: 'subscribe',
      entity: entityType,
      entityId,
      userId,
    });
  }, [sendMessage, userId]);
  
  // Unsubscribe from entity updates
  const unsubscribeFromEntity = useCallback((entityType: string, entityId: number) => {
    const key = `${entityType}:${entityId}`;
    subscriptionRef.current.delete(key);
    
    if (connectionState === 'open') {
      sendMessage({
        type: 'unsubscribe',
        entity: entityType,
        entityId,
        userId,
      });
      
      // Also send a leave notification
      sendMessage({
        type: 'presence',
        action: 'leave',
        entity: entityType,
        entityId,
        userId,
      });
    }
  }, [connectionState, sendMessage, userId]);
  
  return {
    connectionState,
    lastMessage,
    sendMessage,
    subscribeToEntity,
    unsubscribeFromEntity,
  };
}