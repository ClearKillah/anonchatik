const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');

// Инициализация приложения Express
const app = express();
const server = http.createServer(app);

// Настройка CORS
app.use(cors());

// Настройка Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Хранение пользователей и чатов
const users = new Map(); // userId -> socket.id
const waitingUsers = new Set(); // Пользователи в ожидании
const activeChats = new Map(); // chatId -> { user1Id, user2Id }
const userChats = new Map(); // userId -> chatId

// Генерация уникального ID
function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Обработка WebSocket соединений
io.on('connection', (socket) => {
  console.log('Новое соединение:', socket.id);
  
  // Регистрация пользователя
  socket.on('register', (data) => {
    let userId = data.userId;
    
    // Если ID не предоставлен, генерируем новый
    if (!userId) {
      userId = generateId();
    }
    
    // Сохраняем пользователя
    users.set(userId, socket.id);
    socket.userId = userId;
    
    console.log(`Пользователь ${userId} зарегистрирован`);
    
    // Отправляем подтверждение регистрации
    socket.emit('registered', { userId });
  });
  
  // Поиск собеседника
  socket.on('findPartner', () => {
    const userId = socket.userId;
    
    if (!userId) {
      socket.emit('error', { message: 'Вы не зарегистрированы' });
      return;
    }
    
    // Проверяем, не находится ли пользователь уже в чате
    if (userChats.has(userId)) {
      socket.emit('error', { message: 'Вы уже находитесь в чате' });
      return;
    }
    
    console.log(`Пользователь ${userId} ищет собеседника`);
    
    // Отправляем статус ожидания
    socket.emit('chatStatus', { status: 'waiting' });
    
    // Если есть ожидающие пользователи, создаем чат
    if (waitingUsers.size > 0) {
      // Находим первого ожидающего пользователя
      const partnerId = waitingUsers.values().next().value;
      
      // Проверяем, что это не тот же самый пользователь
      if (partnerId === userId) {
        return;
      }
      
      // Удаляем партнера из списка ожидания
      waitingUsers.delete(partnerId);
      
      // Создаем чат
      const chatId = generateId();
      activeChats.set(chatId, { user1Id: userId, user2Id: partnerId });
      userChats.set(userId, chatId);
      userChats.set(partnerId, chatId);
      
      console.log(`Создан чат ${chatId} между ${userId} и ${partnerId}`);
      
      // Отправляем уведомление о начале чата обоим пользователям
      const partnerSocketId = users.get(partnerId);
      
      if (partnerSocketId) {
        io.to(partnerSocketId).emit('chatStart', {
          chatId,
          message: 'Собеседник найден! Можете начинать общение.'
        });
      }
      
      socket.emit('chatStart', {
        chatId,
        message: 'Собеседник найден! Можете начинать общение.'
      });
    } else {
      // Добавляем пользователя в список ожидания
      waitingUsers.add(userId);
    }
  });
  
  // Отправка сообщения
  socket.on('sendMessage', (data) => {
    const userId = socket.userId;
    
    if (!userId) {
      socket.emit('error', { message: 'Вы не зарегистрированы' });
      return;
    }
    
    // Проверяем, находится ли пользователь в чате
    if (!userChats.has(userId)) {
      socket.emit('error', { message: 'Вы не находитесь в чате' });
      return;
    }
    
    const chatId = userChats.get(userId);
    const chat = activeChats.get(chatId);
    
    if (!chat) {
      socket.emit('error', { message: 'Чат не найден' });
      return;
    }
    
    // Определяем ID партнера
    const partnerId = chat.user1Id === userId ? chat.user2Id : chat.user1Id;
    const partnerSocketId = users.get(partnerId);
    
    // Создаем объект сообщения
    const message = {
      message: data.message,
      timestamp: new Date().toISOString()
    };
    
    console.log(`Сообщение от ${userId} к ${partnerId}: ${data.message}`);
    
    // Отправляем сообщение партнеру
    if (partnerSocketId) {
      io.to(partnerSocketId).emit('message', message);
    }
    
    // Отправляем подтверждение отправителю
    socket.emit('messageSent', message);
  });
  
  // Пропуск собеседника
  socket.on('skipPartner', () => {
    const userId = socket.userId;
    
    if (!userId) {
      socket.emit('error', { message: 'Вы не зарегистрированы' });
      return;
    }
    
    // Проверяем, находится ли пользователь в чате
    if (!userChats.has(userId)) {
      socket.emit('error', { message: 'Вы не находитесь в чате' });
      return;
    }
    
    const chatId = userChats.get(userId);
    const chat = activeChats.get(chatId);
    
    if (!chat) {
      socket.emit('error', { message: 'Чат не найден' });
      return;
    }
    
    // Определяем ID партнера
    const partnerId = chat.user1Id === userId ? chat.user2Id : chat.user1Id;
    const partnerSocketId = users.get(partnerId);
    
    console.log(`Пользователь ${userId} пропускает собеседника ${partnerId}`);
    
    // Удаляем чат
    activeChats.delete(chatId);
    userChats.delete(userId);
    userChats.delete(partnerId);
    
    // Отправляем уведомление о завершении чата обоим пользователям
    if (partnerSocketId) {
      io.to(partnerSocketId).emit('chatEnded', {
        message: 'Собеседник покинул чат. Поиск нового собеседника...'
      });
      
      // Автоматически ищем нового собеседника для партнера
      setTimeout(() => {
        const partnerSocket = io.sockets.sockets.get(partnerSocketId);
        if (partnerSocket) {
          partnerSocket.emit('chatStatus', { status: 'waiting' });
          waitingUsers.add(partnerId);
        }
      }, 1000);
    }
    
    socket.emit('chatEnded', {
      message: 'Вы пропустили собеседника. Поиск нового собеседника...'
    });
    
    // Автоматически ищем нового собеседника
    setTimeout(() => {
      socket.emit('chatStatus', { status: 'waiting' });
      waitingUsers.add(userId);
    }, 1000);
  });
  
  // Отключение пользователя
  socket.on('disconnect', () => {
    const userId = socket.userId;
    
    if (!userId) return;
    
    console.log(`Пользователь ${userId} отключился`);
    
    // Удаляем пользователя из списка ожидания
    waitingUsers.delete(userId);
    
    // Проверяем, находится ли пользователь в чате
    if (userChats.has(userId)) {
      const chatId = userChats.get(userId);
      const chat = activeChats.get(chatId);
      
      if (chat) {
        // Определяем ID партнера
        const partnerId = chat.user1Id === userId ? chat.user2Id : chat.user1Id;
        const partnerSocketId = users.get(partnerId);
        
        // Удаляем чат
        activeChats.delete(chatId);
        userChats.delete(userId);
        userChats.delete(partnerId);
        
        // Отправляем уведомление о завершении чата партнеру
        if (partnerSocketId) {
          io.to(partnerSocketId).emit('chatEnded', {
            message: 'Собеседник отключился. Поиск нового собеседника...'
          });
          
          // Автоматически ищем нового собеседника для партнера
          setTimeout(() => {
            const partnerSocket = io.sockets.sockets.get(partnerSocketId);
            if (partnerSocket) {
              partnerSocket.emit('chatStatus', { status: 'waiting' });
              waitingUsers.add(partnerId);
            }
          }, 1000);
        }
      }
    }
    
    // Удаляем пользователя из списка пользователей
    users.delete(userId);
  });
});

// Обслуживание статических файлов из папки build
app.use(express.static(path.join(__dirname, 'react-client/build')));

// Все остальные GET-запросы перенаправляем на index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'react-client/build', 'index.html'));
});

// Определение порта
const PORT = process.env.PORT || 3000;

// Запуск сервера
server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
}); 