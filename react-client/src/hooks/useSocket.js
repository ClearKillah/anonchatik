import { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';

const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [userId, setUserId] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('start'); // 'start', 'waiting', 'chat'
  const [messages, setMessages] = useState([]);
  
  // Initialize socket connection
  useEffect(() => {
    // Определяем URL сервера
    const serverUrl = process.env.NODE_ENV === 'production' 
      ? window.location.origin 
      : 'http://localhost:3000';
      
    const newSocket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    
    setSocket(newSocket);
    
    // Clean up on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);
  
  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;
    
    // Register user
    socket.on('connect', () => {
      console.log('Connected to server');
      
      // Try to get Telegram user ID
      let telegramId = null;
      if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) {
        telegramId = window.Telegram.WebApp.initDataUnsafe.user.id;
      } else {
        // Try to get ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        telegramId = urlParams.get('id');
      }
      
      // Register user
      socket.emit('register', { userId: telegramId });
    });
    
    // Confirmation of registration
    socket.on('registered', (data) => {
      setUserId(data.userId);
      console.log('Registered with ID:', data.userId);
    });
    
    // Chat status
    socket.on('chatStatus', (data) => {
      console.log('Chat status:', data);
      
      if (data.status === 'waiting') {
        setCurrentScreen('waiting');
      }
    });
    
    // Chat start
    socket.on('chatStart', (data) => {
      console.log('Chat started:', data);
      
      setChatId(data.chatId);
      setCurrentScreen('chat');
      
      // Add system message
      setMessages(prev => [...prev, { type: 'system', text: data.message, timestamp: new Date().toISOString() }]);
    });
    
    // Receive message
    socket.on('message', (data) => {
      console.log('Received message:', data);
      
      // Add message to chat
      setMessages(prev => [...prev, { type: 'received', text: data.message, timestamp: data.timestamp }]);
    });
    
    // Message sent confirmation
    socket.on('messageSent', (data) => {
      console.log('Message sent:', data);
      
      // Add sent message to chat
      setMessages(prev => [...prev, { type: 'sent', text: data.message, timestamp: data.timestamp }]);
    });
    
    // Chat ended
    socket.on('chatEnded', (data) => {
      console.log('Chat ended:', data);
      
      // Add system message
      setMessages(prev => [...prev, { type: 'system', text: data.message, timestamp: new Date().toISOString() }]);
      
      // Return to start screen after delay
      setTimeout(() => {
        setChatId(null);
        setCurrentScreen('start');
        setMessages([]);
      }, 2000);
    });
    
    // Error handling
    socket.on('error', (data) => {
      console.error('Error:', data);
      if (data.message) {
        alert(data.message);
      }
    });
    
    // Reconnection
    socket.on('reconnect', (attemptNumber) => {
      console.log(`Reconnected after ${attemptNumber} attempts`);
      
      // Если был ID пользователя, повторно регистрируемся
      if (userId) {
        socket.emit('register', { userId });
      }
    });
    
    // Reconnection attempt
    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`Reconnection attempt ${attemptNumber}`);
    });
    
    // Reconnection error
    socket.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error);
    });
    
    // Reconnection failed
    socket.on('reconnect_failed', () => {
      console.error('Failed to reconnect');
      alert('Не удалось подключиться к серверу. Пожалуйста, обновите страницу.');
    });
    
    // Disconnection
    socket.on('disconnect', (reason) => {
      console.log(`Disconnected from server: ${reason}`);
      
      // Если отключение не было инициировано клиентом, показываем сообщение
      if (reason !== 'io client disconnect') {
        // Добавляем системное сообщение только если пользователь в чате
        if (currentScreen === 'chat') {
          setMessages(prev => [...prev, { 
            type: 'system', 
            text: 'Соединение с сервером потеряно. Пытаемся переподключиться...', 
            timestamp: new Date().toISOString() 
          }]);
        }
      }
    });
    
    return () => {
      // Clean up event listeners
      socket.off('connect');
      socket.off('registered');
      socket.off('chatStatus');
      socket.off('chatStart');
      socket.off('message');
      socket.off('messageSent');
      socket.off('chatEnded');
      socket.off('error');
      socket.off('reconnect');
      socket.off('reconnect_attempt');
      socket.off('reconnect_error');
      socket.off('reconnect_failed');
      socket.off('disconnect');
    };
  }, [socket, userId, currentScreen]);
  
  // Handle find partner button click
  const handleFindPartner = useCallback(() => {
    if (socket && socket.connected) {
      socket.emit('findPartner');
    } else {
      console.log('Socket not connected');
      alert('Переподключение к серверу...');
      
      // Пытаемся переподключиться
      if (socket) {
        socket.connect();
      }
    }
  }, [socket]);
  
  // Handle skip partner button click
  const handleSkipPartner = useCallback(() => {
    if (socket && socket.connected) {
      socket.emit('skipPartner');
    } else {
      console.log('Socket not connected');
      alert('Соединение с сервером потеряно. Пожалуйста, обновите страницу.');
    }
  }, [socket]);
  
  // Handle send message
  const handleSendMessage = useCallback((message) => {
    if (!message.trim() || !socket || !socket.connected) return;
    
    // Send message to server
    socket.emit('sendMessage', { message: message.trim() });
  }, [socket]);
  
  return {
    currentScreen,
    messages,
    userId,
    chatId,
    handleFindPartner,
    handleSkipPartner,
    handleSendMessage
  };
};

export default useSocket; 