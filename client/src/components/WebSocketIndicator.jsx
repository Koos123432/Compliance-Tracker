
import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useWebSocket } from '../context/WebSocketContext';

function WebSocketIndicator() {
  const { isConnected } = useWebSocket();

  return (
    <div className="flex items-center">
      {isConnected ? (
        <Wifi className="h-5 w-5 text-green-500" />
      ) : (
        <WifiOff className="h-5 w-5 text-destructive" />
      )}
    </div>
  );
}

export default WebSocketIndicator;
