
import React, { createContext, useState, useEffect, useContext } from "react";

const WebSocketContext = createContext(null);

export function useWebSocket() {
  return useContext(WebSocketContext);
}

export function WebSocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    try {
      const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`);
      
      ws.onopen = () => {
        console.log('WebSocket connection established');
        setIsConnected(true);
        setSocket(ws);
        setReconnectAttempt(0);
        
        // Authenticate
        ws.send(JSON.stringify({
          type: 'authenticate',
          userId: 1 // Default user for now
        }));
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
      };
      
      ws.onclose = () => {
        console.log('WebSocket connection closed');
        setIsConnected(false);
        setSocket(null);
        
        if (reconnectAttempt < maxReconnectAttempts) {
          const timeout = Math.pow(2, reconnectAttempt) * 1000;
          console.log(`Attempting to reconnect in ${timeout}ms (attempt ${reconnectAttempt + 1}/${maxReconnectAttempts})`);
          setTimeout(() => {
            setReconnectAttempt(prev => prev + 1);
            connect();
          }, timeout);
        }
      };
      
      ws.onerror = (error) => {
        console.log('WebSocket error:', error);
      };
      
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
    }
  };

  useEffect(() => {
    connect();
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [reconnectAttempt]);

  const subscribe = (entity, entityId) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify({
        type: 'subscribe',
        entity,
        entityId
      }));
    }
  };

  const unsubscribe = (entity, entityId) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify({
        type: 'unsubscribe',
        entity,
        entityId
      }));
    }
  };

  const sendMessage = (message) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify(message));
    }
  };

  return (
    <WebSocketContext.Provider value={{ 
      socket,
      isConnected,
      subscribe,
      unsubscribe,
      sendMessage
    }}>
      {children}
    </WebSocketContext.Provider>
  );
}
