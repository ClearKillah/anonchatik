const { v4: uuidv4 } = require('uuid');
const { User, ChatSession } = require('../models/User');

// Хранение информации о пользователях и их собеседниках в памяти
const users = new Map(); // Map для хранения информации о пользователях: socketId -> userId
const userSockets = new Map(); // Map для хранения сокетов пользователей: userId -> socketId
const waitingUsers = new Set(); // Сет пользователей, ожидающих собеседника
const activeChats = new Map(); // Map для хранения активных чатов: userId -> partnerId

/**
 * Сохранение информации о чат-сессии в базу данных
 * @param {number} userId - ID пользователя
 * @param {number} partnerId - ID собеседника
 * @param {boolean} skipped - Флаг, был ли пропущен собеседник
 */
const saveChatSession = async (userId, partnerId, skipped = false) => {
  try {
    const userRecord = await User.findOne({ where: { sessionId: userId } });
    const partnerRecord = await User.findOne({ where: { sessionId: partnerId } });

    if (userRecord && partnerRecord) {
      await ChatSession.create({
        userId: userRecord.id,
        partnerId: partnerRecord.id,
        startTime: new Date(),
        endTime: skipped ? new Date() : null,
        skipped
      });
    }
  } catch (error) {
    console.error('Error saving chat session:', error);
  }
};

/**
 * Обновление чат-сессии при завершении
 * @param {number} userId - ID пользователя
 * @param {number} partnerId - ID собеседника
 * @param {boolean} skipped - Флаг, был ли пропущен собеседник
 */
const updateChatSession = async (userId, partnerId, skipped = false) => {
  try {
    const userRecord = await User.findOne({ where: { sessionId: userId } });
    const partnerRecord = await User.findOne({ where: { sessionId: partnerId } });

    if (userRecord && partnerRecord) {
      const session = await ChatSession.findOne({
        where: {
          userId: userRecord.id,
          partnerId: partnerRecord.id,
          endTime: null
        },
        order: [['createdAt', 'DESC']]
      });

      if (session) {
        session.endTime = new Date();
        session.skipped = skipped;
        await session.save();
      }
    }
  } catch (error) {
    console.error('Error updating chat session:', error);
  }
};

/**
 * Настройка сокетов для чата
 * @param {object} io - Socket.IO сервер
 */
module.exports = (io) => {
  // Добавляем интервал для проверки и очистки неактивных соединений
  setInterval(() => {
    console.log(`Active connections check: ${userSockets.size} users, ${waitingUsers.size} waiting`);
    
    // Проверяем все ожидающие соединения
    for (const waitingUserId of waitingUsers) {
      const socketId = userSockets.get(waitingUserId);
      if (!socketId || !io.sockets.sockets.get(socketId)) {
        console.log(`Removing stale waiting user: ${waitingUserId}`);
        waitingUsers.delete(waitingUserId);
        userSockets.delete(waitingUserId);
      }
    }
    
    // Если есть хотя бы 2 ожидающих пользователя, пытаемся их соединить
    if (waitingUsers.size >= 2) {
      console.log(`Attempting to match waiting users: ${Array.from(waitingUsers).join(', ')}`);
      matchWaitingUsers(io);
    }
  }, 10000); // Проверка каждые 10 секунд
  
  /**
   * Функция для соединения ожидающих пользователей
   * @param {object} io - Socket.IO сервер
   */
  function matchWaitingUsers(io) {
    const waitingArray = Array.from(waitingUsers);
    
    // Перемешиваем массив для случайного выбора
    for (let i = waitingArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [waitingArray[i], waitingArray[j]] = [waitingArray[j], waitingArray[i]];
    }
    
    // Соединяем пользователей попарно
    for (let i = 0; i < waitingArray.length - 1; i += 2) {
      const userId1 = waitingArray[i];
      const userId2 = waitingArray[i + 1];
      
      const socketId1 = userSockets.get(userId1);
      const socketId2 = userSockets.get(userId2);
      
      if (!socketId1 || !socketId2) {
        console.log(`Skipping match due to missing socket: ${userId1} or ${userId2}`);
        continue;
      }
      
      // Удаляем пользователей из списка ожидания
      waitingUsers.delete(userId1);
      waitingUsers.delete(userId2);
      
      // Создаем чат
      const chatId = uuidv4();
      activeChats.set(userId1, { partnerId: userId2, chatId });
      activeChats.set(userId2, { partnerId: userId1, chatId });
      
      // Уведомляем обоих участников о создании чата
      io.to(socketId1).emit('chatStart', { 
        chatId, 
        message: 'Собеседник найден! Можете начинать общение.' 
      });
      
      io.to(socketId2).emit('chatStart', { 
        chatId, 
        message: 'Собеседник найден! Можете начинать общение.' 
      });
      
      // Сохраняем информацию о чат-сессии
      saveChatSession(userId1, userId2);
      
      console.log(`Matched users: ${userId1} with ${userId2}, chatId: ${chatId}`);
    }
  }

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Регистрация нового пользователя в системе
    socket.on('register', async ({ userId }) => {
      console.log(`Registration request for userId: ${userId || 'not provided'}`);
      
      // Генерируем ID, если не предоставлен
      if (!userId) {
        userId = uuidv4();
        console.log(`Generated new userId: ${userId}`);
      }

      // Проверяем, был ли пользователь уже подключен
      const oldSocketId = userSockets.get(userId);
      if (oldSocketId && oldSocketId !== socket.id) {
        console.log(`User ${userId} was already connected with socket ${oldSocketId}. Disconnecting old socket.`);
        // Если старое соединение еще активно, отключаем его
        const oldSocket = io.sockets.sockets.get(oldSocketId);
        if (oldSocket) {
          oldSocket.disconnect(true);
          console.log(`Disconnected old socket ${oldSocketId}`);
        } else {
          console.log(`Old socket ${oldSocketId} not found, may have already disconnected`);
        }
        
        // Если пользователь был в чате, завершаем его
        if (activeChats.has(userId)) {
          const { partnerId } = activeChats.get(userId);
          console.log(`User ${userId} was in chat with ${partnerId}. Ending chat.`);
          
          const partnerSocketId = userSockets.get(partnerId);
          if (partnerSocketId) {
            io.to(partnerSocketId).emit('chatEnded', { 
              message: 'Собеседник переподключился. Чат завершен.' 
            });
            console.log(`Notified partner ${partnerId} about reconnection`);
          }
          
          // Обновляем чат-сессию
          updateChatSession(userId, partnerId, false);
          
          // Завершаем чат
          endChat(userId, partnerId);
        }
        
        // Удаляем пользователя из списка ожидания (если он там был)
        if (waitingUsers.has(userId)) {
          waitingUsers.delete(userId);
          console.log(`Removed reconnecting user ${userId} from waiting list`);
        }
      }

      // Регистрируем нового пользователя
      users.set(socket.id, userId);
      userSockets.set(userId, socket.id);

      // Сохраняем пользователя в базу данных или обновляем информацию
      try {
        let userRecord = await User.findOne({ where: { sessionId: userId } });
        if (!userRecord) {
          userRecord = await User.create({
            sessionId: userId,
            telegramId: isNaN(userId) ? null : Number(userId),
            lastActive: new Date()
          });
          console.log(`Created new user record in database for ${userId}`);
        } else {
          userRecord.lastActive = new Date();
          await userRecord.save();
          console.log(`Updated existing user record in database for ${userId}`);
        }
      } catch (error) {
        console.error('Error saving user to database:', error);
      }

      // Отправляем пользователю его ID
      socket.emit('registered', { userId });
      
      console.log(`User registered successfully: ${userId} with socket ${socket.id}`);
    });

    // Пользователь хочет найти собеседника
    socket.on('findPartner', () => {
      const userId = users.get(socket.id);
      if (!userId) {
        console.log(`User not found for socket ${socket.id}`);
        return;
      }

      console.log(`User ${userId} is looking for a partner. Current waiting users: ${Array.from(waitingUsers).join(', ')}`);

      // Проверяем, не в активном ли чате пользователь
      if (activeChats.has(userId)) {
        // Если пользователь уже в чате, сообщаем ему об этом
        socket.emit('chatStatus', { status: 'active', message: 'Вы уже в чате с собеседником.' });
        console.log(`User ${userId} is already in an active chat`);
        return;
      }

      // Проверяем, не ожидает ли уже пользователь собеседника
      if (waitingUsers.has(userId)) {
        // Если пользователь уже в списке ожидания, сообщаем ему об этом
        socket.emit('chatStatus', { status: 'waiting', message: 'Поиск собеседника уже идет.' });
        console.log(`User ${userId} is already waiting for a partner`);
        return;
      }

      // Ищем доступного собеседника в списке ожидания
      if (waitingUsers.size > 0) {
        let partnerId = null;
        
        // Находим первого подходящего собеседника
        for (const waitingUserId of waitingUsers) {
          if (waitingUserId !== userId) {
            partnerId = waitingUserId;
            console.log(`Found potential partner ${partnerId} for user ${userId}`);
            break;
          }
        }

        // Если нашли подходящего собеседника
        if (partnerId) {
          // Удаляем собеседника из списка ожидания
          waitingUsers.delete(partnerId);
          
          // Создаем чат
          const chatId = uuidv4();
          activeChats.set(userId, { partnerId, chatId });
          activeChats.set(partnerId, { partnerId: userId, chatId });
          
          // Получаем сокет собеседника
          const partnerSocketId = userSockets.get(partnerId);
          
          if (!partnerSocketId) {
            console.log(`Partner socket not found for ${partnerId}. Removing from active chats.`);
            activeChats.delete(userId);
            activeChats.delete(partnerId);
            socket.emit('chatStatus', { status: 'waiting', message: 'Поиск собеседника...' });
            waitingUsers.add(userId);
            return;
          }
          
          // Уведомляем обоих участников о создании чата
          socket.emit('chatStart', { 
            chatId, 
            message: 'Собеседник найден! Можете начинать общение.' 
          });
          
          io.to(partnerSocketId).emit('chatStart', { 
            chatId, 
            message: 'Собеседник найден! Можете начинать общение.' 
          });
          
          // Сохраняем информацию о чат-сессии
          saveChatSession(userId, partnerId);
          
          console.log(`Chat started: ${userId} with ${partnerId}, chatId: ${chatId}`);
          return;
        } else {
          console.log(`No suitable partner found for user ${userId} despite ${waitingUsers.size} waiting users`);
        }
      }

      // Если не нашли собеседника, добавляем пользователя в список ожидания
      waitingUsers.add(userId);
      socket.emit('chatStatus', { status: 'waiting', message: 'Поиск собеседника...' });
      console.log(`User ${userId} is now waiting for a partner. Total waiting users: ${waitingUsers.size}`);
    });

    // Отправка сообщения
    socket.on('sendMessage', ({ message }) => {
      const userId = users.get(socket.id);
      if (!userId || !activeChats.has(userId)) {
        socket.emit('error', { message: 'Вы не в чате.' });
        return;
      }

      const { partnerId, chatId } = activeChats.get(userId);
      const partnerSocketId = userSockets.get(partnerId);
      
      if (!partnerSocketId) {
        socket.emit('error', { message: 'Собеседник не найден.' });
        return;
      }

      // Отправляем сообщение собеседнику
      io.to(partnerSocketId).emit('message', { 
        chatId,
        message,
        timestamp: new Date().toISOString()
      });
      
      // Подтверждаем отправку сообщения
      socket.emit('messageSent', { 
        chatId,
        message,
        timestamp: new Date().toISOString()
      });
    });

    // Пропуск текущего собеседника (Skip)
    socket.on('skipPartner', () => {
      const userId = users.get(socket.id);
      if (!userId || !activeChats.has(userId)) {
        socket.emit('error', { message: 'Вы не в чате.' });
        return;
      }

      const { partnerId } = activeChats.get(userId);
      const partnerSocketId = userSockets.get(partnerId);
      
      // Обновляем чат-сессию как завершенную
      updateChatSession(userId, partnerId, true);
      
      // Завершаем чат для обоих участников
      endChat(userId, partnerId);
      
      // Уведомляем обоих участников о завершении чата
      socket.emit('chatEnded', { message: 'Вы пропустили собеседника.' });
      
      if (partnerSocketId) {
        io.to(partnerSocketId).emit('chatEnded', { 
          message: 'Собеседник решил завершить чат.' 
        });
      }

      console.log(`Chat skipped: ${userId} skipped ${partnerId}`);
    });

    // Отключение пользователя
    socket.on('disconnect', () => {
      const userId = users.get(socket.id);
      if (!userId) {
        console.log(`Disconnect: User not found for socket ${socket.id}`);
        return;
      }

      console.log(`User disconnecting: ${userId}`);

      // Проверяем, был ли пользователь в активном чате
      if (activeChats.has(userId)) {
        const { partnerId } = activeChats.get(userId);
        const partnerSocketId = userSockets.get(partnerId);
        
        console.log(`Disconnecting user ${userId} was in chat with ${partnerId}`);
        
        // Обновляем чат-сессию
        updateChatSession(userId, partnerId, false);
        
        // Завершаем чат
        endChat(userId, partnerId);
        
        // Уведомляем собеседника о выходе пользователя
        if (partnerSocketId) {
          io.to(partnerSocketId).emit('chatEnded', { 
            message: 'Собеседник отключился.' 
          });
          console.log(`Notified partner ${partnerId} about disconnect`);
        } else {
          console.log(`Partner socket not found for ${partnerId}`);
        }
      }

      // Удаляем пользователя из списка ожидания (если он там был)
      if (waitingUsers.has(userId)) {
        waitingUsers.delete(userId);
        console.log(`Removed user ${userId} from waiting list. Remaining: ${waitingUsers.size}`);
      }
      
      // Удаляем информацию о пользователе
      users.delete(socket.id);
      userSockets.delete(userId);
      
      console.log(`User disconnected: ${userId}. Current waiting users: ${Array.from(waitingUsers).join(', ')}`);
    });
  });

  /**
   * Функция для завершения чата между двумя пользователями
   * @param {string} userId1 - ID первого пользователя
   * @param {string} userId2 - ID второго пользователя
   */
  function endChat(userId1, userId2) {
    activeChats.delete(userId1);
    activeChats.delete(userId2);
  }
}; 