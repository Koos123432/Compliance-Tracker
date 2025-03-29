
import React, { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);

  useEffect(() => {
    const connectWebSocket = (retryCount = 0, maxRetries = 5) => {
      const ws = new WebSocket(`wss://${window.location.host}/ws`);

      ws.onopen = () => {
        console.log('WebSocket connection established');
        setSocket(ws);
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        setLastMessage(message);
        console.log('WebSocket message received:', message);
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
        setIsConnected(false);
        setSocket(null);

        if (retryCount < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, retryCount), 16000);
          console.log(`Attempting to reconnect in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
          setTimeout(() => connectWebSocket(retryCount + 1, maxRetries), delay);
        }
      };

      ws.onerror = (error) => {
        console.log('WebSocket error:', error);
      };

      return ws;
    };

    const ws = connectWebSocket();
    return () => {
      ws.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ socket, isConnected, lastMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
}

WebSocketProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}
