import React, { useEffect, useState } from 'react';
import { useWebSocketContext } from '@/context/WebSocketContext';
import { Badge } from '@/components/ui/badge';
import { CircleAlertIcon, WifiIcon, WifiOffIcon } from 'lucide-react';

interface WebSocketIndicatorProps {
  className?: string;
}

const WebSocketIndicator: React.FC<WebSocketIndicatorProps> = ({ className = '' }) => {
  const { connectionState, lastMessage } = useWebSocketContext();
  const [lastEvent, setLastEvent] = useState<string | null>(null);
  const [eventCount, setEventCount] = useState(0);
  
  // Update last event when a message is received
  useEffect(() => {
    if (lastMessage && lastMessage.type !== 'info' && lastMessage.type !== 'authenticated') {
      setLastEvent(formatEventMessage(lastMessage));
      setEventCount(prev => prev + 1);
    }
  }, [lastMessage]);
  
  // Format event message based on message type
  const formatEventMessage = (message: any): string => {
    if (!message) return '';
    
    switch (message.type) {
      case 'subscribed':
        return `Subscribed to ${message.entity} #${message.entityId}`;
      case 'unsubscribed':
        return `Unsubscribed from ${message.entity} #${message.entityId}`;
      case 'update':
        return `${message.entity} #${message.entityId} was ${message.action}`;
      case 'status':
        return `WebSocket status updated`;
      case 'error':
        return `Error: ${message.message}`;
      default:
        return `Message received: ${message.type}`;
    }
  };
  
  // Status display content
  const getStatusContent = () => {
    switch (connectionState) {
      case 'connecting':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-500">
            <CircleAlertIcon className="w-3 h-3 mr-1 animate-pulse" />
            Connecting...
          </Badge>
        );
      case 'open':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-500">
            <WifiIcon className="w-3 h-3 mr-1" />
            Connected {eventCount > 0 && `(${eventCount})`}
          </Badge>
        );
      case 'closed':
        return (
          <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-500">
            <WifiOffIcon className="w-3 h-3 mr-1" />
            Disconnected
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-500">
            <CircleAlertIcon className="w-3 h-3 mr-1" />
            Connection Error
          </Badge>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className={`flex flex-col items-start ${className}`}>
      <div className="flex items-center">
        {getStatusContent()}
      </div>
      {lastEvent && connectionState === 'open' && (
        <span className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate">
          {lastEvent}
        </span>
      )}
    </div>
  );
};

export default WebSocketIndicator;