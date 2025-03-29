
import React from 'react';
import { Router, Route, Switch } from 'wouter';
import Dashboard from './pages/Dashboard';
import Header from './components/layout/Header';
import { useWebSocket } from './context/WebSocketContext';

export default function App() {
  const { isConnected } = useWebSocket();

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Header />
        <Switch>
          <Route path="/" component={Dashboard} />
        </Switch>
        {!isConnected && (
          <div className="fixed bottom-4 right-4 bg-destructive text-white px-4 py-2 rounded-md">
            Disconnected - Attempting to reconnect...
          </div>
        )}
      </div>
    </Router>
  );
}
