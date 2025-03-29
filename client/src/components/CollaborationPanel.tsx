import React, { useState, useEffect, useRef } from 'react';
import { useWebSocketContext } from '@/context/WebSocketContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Users, MessageSquare, Info } from "lucide-react";
import { format } from 'date-fns';

interface CollaborationPanelProps {
  entityType: string;
  entityId: number;
  entityName: string;
}

interface CollaborationMessage {
  id: string;
  userId: number;
  userName: string;
  message: string;
  timestamp: number;
}

interface ActiveUser {
  userId: number;
  userName: string;
  joinedAt: number;
}

export default function CollaborationPanel({ entityType, entityId, entityName }: CollaborationPanelProps) {
  const { 
    connectionState, 
    lastMessage, 
    sendMessage, 
    subscribeToEntity, 
    unsubscribeFromEntity 
  } = useWebSocketContext();
  
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<CollaborationMessage[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Subscribe to entity updates on mount and unsubscribe on unmount
  useEffect(() => {
    if (connectionState === 'open') {
      // Subscribe to the entity
      subscribeToEntity(entityType, entityId);
      
      // Send presence notification
      sendMessage({
        type: 'presence',
        action: 'join',
        entity: entityType,
        entityId,
        // Mock user ID and name until we have authentication
        userId: 1,
        userName: 'Current User'
      });
    }
    
    return () => {
      if (connectionState === 'open') {
        unsubscribeFromEntity(entityType, entityId);
      }
    };
  }, [entityType, entityId, connectionState, subscribeToEntity, unsubscribeFromEntity, sendMessage]);
  
  // Handle incoming messages
  useEffect(() => {
    if (!lastMessage) return;
    
    // Check if message is for this entity
    if (lastMessage.entity === entityType && lastMessage.entityId === entityId) {
      switch (lastMessage.type) {
        case 'history':
          // Received message history
          if (Array.isArray(lastMessage.data)) {
            setMessages(lastMessage.data);
          }
          break;
        
        case 'chat':
          // Add new chat message
          setMessages(prev => [...prev, {
            id: lastMessage.id || `msg-${Date.now()}`,
            userId: lastMessage.userId || 0,
            userName: lastMessage.userName || 'Unknown User',
            message: lastMessage.message || '',
            timestamp: lastMessage.timestamp || Date.now()
          }]);
          break;
        
        case 'users':
          // Update active users list
          if (Array.isArray(lastMessage.data)) {
            setActiveUsers(lastMessage.data);
          }
          break;
        
        case 'presence':
          // Handle user joining/leaving
          if (lastMessage.action === 'join') {
            setActiveUsers(prev => {
              // Only add if not already in the list
              if (!prev.some(u => u.userId === lastMessage.userId)) {
                return [...prev, {
                  userId: lastMessage.userId || 0,
                  userName: lastMessage.userName || 'Unknown User',
                  joinedAt: lastMessage.timestamp || Date.now()
                }];
              }
              return prev;
            });
          } else if (lastMessage.action === 'leave') {
            setActiveUsers(prev => prev.filter(u => u.userId !== lastMessage.userId));
          }
          break;
      }
    }
  }, [lastMessage, entityType, entityId]);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Send a new message
  const handleSendMessage = () => {
    if (!messageInput.trim() || connectionState !== 'open') return;
    
    sendMessage({
      type: 'chat',
      entity: entityType,
      entityId,
      // Mock user ID and name until we have authentication
      userId: 1,
      userName: 'Current User',
      message: messageInput
    });
    
    setMessageInput('');
  };
  
  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Collaboration: {entityName}</CardTitle>
        <CardDescription>
          <Badge variant={connectionState === 'open' ? 'default' : 'destructive'} className="mr-2">
            {connectionState === 'open' ? 'Connected' : 'Disconnected'}
          </Badge>
          {activeUsers.length > 0 && (
            <Badge variant="outline">{activeUsers.length} Active User{activeUsers.length !== 1 ? 's' : ''}</Badge>
          )}
        </CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="chat" className="flex-1 flex flex-col">
        <TabsList className="mx-6">
          <TabsTrigger value="chat" className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>Chat</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>Active Users</span>
          </TabsTrigger>
          <TabsTrigger value="info" className="flex items-center gap-1">
            <Info className="h-4 w-4" />
            <span>Information</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Chat Tab */}
        <TabsContent value="chat" className="flex-1 flex flex-col mt-0 px-6 pt-2">
          <ScrollArea className="flex-1 pr-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
                <p>No messages yet</p>
                <p className="text-sm">Be the first to send a message!</p>
              </div>
            ) : (
              <div className="space-y-4 py-2">
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.userId === 1 ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.userId !== 1 && (
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback>{msg.userName.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`max-w-[80%] ${msg.userId === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg px-3 py-2`}>
                      <div className="flex justify-between gap-2 mb-1">
                        <span className={`text-xs font-medium ${msg.userId === 1 ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                          {msg.userId === 1 ? 'You' : msg.userName}
                        </span>
                        <span className={`text-xs ${msg.userId === 1 ? 'text-primary-foreground/60' : 'text-muted-foreground/60'}`}>
                          {format(new Date(msg.timestamp), 'HH:mm')}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap break-words text-sm">{msg.message}</p>
                    </div>
                    {msg.userId === 1 && (
                      <Avatar className="h-8 w-8 ml-2">
                        <AvatarFallback>CU</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>
        </TabsContent>
        
        {/* Active Users Tab */}
        <TabsContent value="users" className="flex-1 mt-0 px-6 pt-2">
          <ScrollArea className="h-full pr-4">
            {activeUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <Users className="h-8 w-8 mb-2 opacity-50" />
                <p>No active users</p>
              </div>
            ) : (
              <div className="space-y-2 py-2">
                {activeUsers.map((user) => (
                  <div key={user.userId} className="flex items-center p-2 rounded-md hover:bg-muted">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarFallback>{user.userName.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        Active since {format(new Date(user.joinedAt), 'HH:mm')}
                      </p>
                    </div>
                    {user.userId === 1 && (
                      <Badge variant="outline" className="ml-auto">You</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
        
        {/* Information Tab */}
        <TabsContent value="info" className="flex-1 mt-0 px-6 pt-2">
          <ScrollArea className="h-full pr-4">
            <div className="py-4 space-y-4">
              <div>
                <h3 className="font-semibold mb-1">About Collaboration</h3>
                <p className="text-sm text-muted-foreground">
                  This collaboration panel allows real-time communication between team members.
                  All messages are visible to everyone working on this {entityType}.
                </p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-semibold mb-1">Current {entityType}</h3>
                <p className="text-sm">{entityName}</p>
                <p className="text-xs text-muted-foreground mt-1">ID: {entityId}</p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-semibold mb-1">Connection Status</h3>
                <Badge variant={connectionState === 'open' ? 'default' : 'destructive'}>
                  {connectionState === 'open' ? 'Connected' : 'Disconnected'}
                </Badge>
                {connectionState !== 'open' && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Try refreshing the page if you're having connection issues.
                  </p>
                )}
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
      
      <CardFooter className="pt-0">
        <div className="flex w-full items-center space-x-2">
          <Input
            placeholder="Type your message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={connectionState !== 'open'}
            className="flex-1"
          />
          <Button 
            size="icon" 
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || connectionState !== 'open'}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}