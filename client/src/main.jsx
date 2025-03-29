
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { WebSocketProvider } from './context/WebSocketContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WebSocketProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WebSocketProvider>
  </React.StrictMode>
);
