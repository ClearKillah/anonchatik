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
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Регистрация нового пользователя в системе
    socket.on('register', async ({ userId }) => {
      // Генерируем ID, если не предоставлен
      if (!userId) {
        userId = uuidv4();
      }

      // Проверяем, был ли пользователь уже подключен
      const oldSocketId = userSockets.get(userId);
      if (oldSocketId && oldSocketId !== socket.id) {
        // Если старое соединение еще активно, отключаем его
        const oldSocket = io.sockets.sockets.get(oldSocketId);
        if (oldSocket) {
          oldSocket.disconnect(true);
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
        } else {
          userRecord.lastActive = new Date();
          await userRecord.save();
        }
      } catch (error) {
        console.error('Error saving user to database:', error);
      }

      // Отправляем пользователю его ID
      socket.emit('registered', { userId });
      
      console.log(`User registered: ${userId}`);
    });

    // Пользователь хочет найти собеседника
    socket.on('findPartner', () => {
      const userId = users.get(socket.id);
      if (!userId) return;

      // Проверяем, не в активном ли чате пользователь
      if (activeChats.has(userId)) {
        // Если пользователь уже в чате, сообщаем ему об этом
        socket.emit('chatStatus', { status: 'active', message: 'Вы уже в чате с собеседником.' });
        return;
      }

      // Проверяем, не ожидает ли уже пользователь собеседника
      if (waitingUsers.has(userId)) {
        // Если пользователь уже в списке ожидания, сообщаем ему об этом
        socket.emit('chatStatus', { status: 'waiting', message: 'Поиск собеседника уже идет.' });
        return;
      }

      // Ищем доступного собеседника в списке ожидания
      if (waitingUsers.size > 0) {
        let partnerId = null;
        
        // Находим первого подходящего собеседника
        for (const waitingUserId of waitingUsers) {
          if (waitingUserId !== userId) {
            partnerId = waitingUserId;
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
        }
      }

      // Если не нашли собеседника, добавляем пользователя в список ожидания
      waitingUsers.add(userId);
      socket.emit('chatStatus', { status: 'waiting', message: 'Поиск собеседника...' });
      console.log(`User ${userId} is waiting for a partner`);
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
      if (!userId) return;

      // Проверяем, был ли пользователь в активном чате
      if (activeChats.has(userId)) {
        const { partnerId } = activeChats.get(userId);
        const partnerSocketId = userSockets.get(partnerId);
        
        // Обновляем чат-сессию
        updateChatSession(userId, partnerId, false);
        
        // Завершаем чат
        endChat(userId, partnerId);
        
        // Уведомляем собеседника о выходе пользователя
        if (partnerSocketId) {
          io.to(partnerSocketId).emit('chatEnded', { 
            message: 'Собеседник отключился.' 
          });
        }
      }

      // Удаляем пользователя из списка ожидания (если он там был)
      waitingUsers.delete(userId);
      
      // Удаляем информацию о пользователе
      users.delete(socket.id);
      userSockets.delete(userId);
      
      console.log(`User disconnected: ${userId}`);
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