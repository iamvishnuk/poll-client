'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback
} from 'react';
import { IPoll, TOption } from '@/definition/interface';

interface WebSocketMessage {
  type:
    | 'vote_update'
    | 'new_poll'
    | 'poll_deleted'
    | 'connection_count'
    | 'poll_data'
    | 'pong';
  poll_id?: string;
  option_id?: string;
  new_vote_count?: number;
  option_value?: string;
  all_options?: TOption[];
  poll?: IPoll;
  count?: number;
  question?: string;
  description?: string;
  options?: TOption[];
}

interface MessageToSend {
  type: string;
  [key: string]: unknown;
}

interface WebSocketContextType {
  // Connection management
  connectToPoll: (pollId: string) => void;
  disconnectFromPoll: () => void;
  connectToGeneral: () => void;
  disconnectFromGeneral: () => void;

  // Connection status
  isConnectedToPoll: boolean;
  isConnectedToGeneral: boolean;
  currentPollId: string | null;
  connectionCount: number;

  // Event handlers
  onVoteUpdate: (callback: (data: WebSocketMessage) => void) => void;
  onNewPoll: (callback: (data: WebSocketMessage) => void) => void;
  onPollDeleted: (callback: (data: WebSocketMessage) => void) => void;
  onConnectionCountUpdate: (callback: (count: number) => void) => void;
  onPollDataReceived: (callback: (data: WebSocketMessage) => void) => void;

  // Utility
  sendMessage: (message: MessageToSend) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: React.ReactNode;
  baseUrl?: string;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
  baseUrl = 'ws://localhost:8000'
}) => {
  const [isConnectedToPoll, setIsConnectedToPoll] = useState(false);
  const [isConnectedToGeneral, setIsConnectedToGeneral] = useState(false);
  const [currentPollId, setCurrentPollId] = useState<string | null>(null);
  const [connectionCount, setConnectionCount] = useState(0);

  const pollSocketRef = useRef<WebSocket | null>(null);
  const generalSocketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Event callback refs
  const voteUpdateCallbackRef = useRef<
    ((data: WebSocketMessage) => void) | null
  >(null);
  const newPollCallbackRef = useRef<((data: WebSocketMessage) => void) | null>(
    null
  );
  const pollDeletedCallbackRef = useRef<
    ((data: WebSocketMessage) => void) | null
  >(null);
  const connectionCountCallbackRef = useRef<((count: number) => void) | null>(
    null
  );
  const pollDataCallbackRef = useRef<((data: WebSocketMessage) => void) | null>(
    null
  );

  // Function refs to avoid circular dependencies
  const connectToPollRef = useRef<((pollId: string) => void) | null>(null);
  const connectToGeneralRef = useRef<(() => void) | null>(null);

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);

      switch (message.type) {
        case 'vote_update':
          if (voteUpdateCallbackRef.current) {
            voteUpdateCallbackRef.current(message);
          }
          break;

        case 'new_poll':
          if (newPollCallbackRef.current) {
            newPollCallbackRef.current(message);
          }
          break;

        case 'poll_deleted':
          if (pollDeletedCallbackRef.current) {
            pollDeletedCallbackRef.current(message);
          }
          break;

        case 'connection_count':
          setConnectionCount(message.count || 0);
          if (connectionCountCallbackRef.current) {
            connectionCountCallbackRef.current(message.count || 0);
          }
          break;

        case 'poll_data':
          if (pollDataCallbackRef.current) {
            pollDataCallbackRef.current(message);
          }
          break;

        case 'pong':
          // Handle pong response
          console.log('Received pong from server');
          break;

        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }, []);

  const disconnectFromPoll = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (pollSocketRef.current) {
      pollSocketRef.current.close(1000, 'Intentional disconnect');
      pollSocketRef.current = null;
    }

    setIsConnectedToPoll(false);
    setCurrentPollId(null);
    setConnectionCount(0);
  }, []);

  const disconnectFromGeneral = useCallback(() => {
    if (generalSocketRef.current) {
      generalSocketRef.current.close(1000, 'Intentional disconnect');
      generalSocketRef.current = null;
    }

    setIsConnectedToGeneral(false);
  }, []);

  const connectToPoll = useCallback(
    (pollId: string) => {
      // Disconnect from current poll if connected
      if (pollSocketRef.current) {
        disconnectFromPoll();
      }

      const wsUrl = `${baseUrl}/ws/${pollId}`;
      const socket = new WebSocket(wsUrl);

      const reconnectToPoll = () => {
        console.log('Attempting to reconnect to poll...');
        if (connectToPollRef.current) {
          connectToPollRef.current(pollId);
        }
      };

      socket.onopen = () => {
        console.log(`Connected to poll WebSocket: ${pollId}`);
        setIsConnectedToPoll(true);
        setCurrentPollId(pollId);

        // Send ping to test connection
        socket.send(JSON.stringify({ type: 'ping' }));
      };

      socket.onmessage = (event) => handleMessage(event);

      socket.onclose = (event) => {
        console.log(`Poll WebSocket closed: ${event.code} ${event.reason}`);
        setIsConnectedToPoll(false);
        setCurrentPollId(null);
        setConnectionCount(0);

        // Auto-reconnect if connection was not closed intentionally
        if (event.code !== 1000 && event.code !== 1001) {
          reconnectTimeoutRef.current = setTimeout(reconnectToPoll, 3000);
        }
      };

      socket.onerror = (error) => {
        console.error('Poll WebSocket error:', error);
      };

      pollSocketRef.current = socket;
    },
    [baseUrl, handleMessage, disconnectFromPoll]
  );

  const connectToGeneral = useCallback(() => {
    if (generalSocketRef.current) {
      return; // Already connected
    }

    const wsUrl = `${baseUrl}/ws`;
    const socket = new WebSocket(wsUrl);

    const reconnectToGeneral = () => {
      console.log('Attempting to reconnect to general...');
      if (connectToGeneralRef.current) {
        connectToGeneralRef.current();
      }
    };

    socket.onopen = () => {
      console.log('Connected to general WebSocket');
      setIsConnectedToGeneral(true);

      // Send ping to test connection
      socket.send(JSON.stringify({ type: 'ping' }));
    };

    socket.onmessage = (event) => handleMessage(event);

    socket.onclose = (event) => {
      console.log(`General WebSocket closed: ${event.code} ${event.reason}`);
      setIsConnectedToGeneral(false);

      // Auto-reconnect if connection was not closed intentionally
      if (event.code !== 1000 && event.code !== 1001) {
        setTimeout(reconnectToGeneral, 3000);
      }
    };

    socket.onerror = (error) => {
      console.error('General WebSocket error:', error);
    };

    generalSocketRef.current = socket;
  }, [baseUrl, handleMessage]);

  // Set function refs to avoid circular dependencies
  useEffect(() => {
    connectToPollRef.current = connectToPoll;
    connectToGeneralRef.current = connectToGeneral;
  }, [connectToPoll, connectToGeneral]);

  const sendMessage = useCallback((message: MessageToSend) => {
    const socket = pollSocketRef.current || generalSocketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      console.warn('No active WebSocket connection to send message');
    }
  }, []);

  // Event handler registration functions
  const onVoteUpdate = useCallback(
    (callback: (data: WebSocketMessage) => void) => {
      voteUpdateCallbackRef.current = callback;
    },
    []
  );

  const onNewPoll = useCallback(
    (callback: (data: WebSocketMessage) => void) => {
      newPollCallbackRef.current = callback;
    },
    []
  );

  const onPollDeleted = useCallback(
    (callback: (data: WebSocketMessage) => void) => {
      pollDeletedCallbackRef.current = callback;
    },
    []
  );

  const onConnectionCountUpdate = useCallback(
    (callback: (count: number) => void) => {
      connectionCountCallbackRef.current = callback;
    },
    []
  );

  const onPollDataReceived = useCallback(
    (callback: (data: WebSocketMessage) => void) => {
      pollDataCallbackRef.current = callback;
    },
    []
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectFromPoll();
      disconnectFromGeneral();
      const timeout = reconnectTimeoutRef.current;
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [disconnectFromPoll, disconnectFromGeneral]);

  const contextValue: WebSocketContextType = {
    connectToPoll,
    disconnectFromPoll,
    connectToGeneral,
    disconnectFromGeneral,
    isConnectedToPoll,
    isConnectedToGeneral,
    currentPollId,
    connectionCount,
    onVoteUpdate,
    onNewPoll,
    onPollDeleted,
    onConnectionCountUpdate,
    onPollDataReceived,
    sendMessage
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};
