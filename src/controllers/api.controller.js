const { User, ChatSession } = require('../models/User');
const { Op } = require('sequelize');

/**
 * Получение общей статистики чатов
 * @param {object} req - объект запроса
 * @param {object} res - объект ответа
 */
exports.getStats = async (req, res) => {
  try {
    // Получаем общее количество пользователей
    const totalUsers = await User.count();

    // Получаем количество активных пользователей за последние 24 часа
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const activeUsers = await User.count({
      where: {
        lastActive: {
          [Op.gte]: oneDayAgo
        }
      }
    });

    // Получаем общее количество чатов
    const totalChats = await ChatSession.count();

    // Получаем количество чатов за последние 24 часа
    const recentChats = await ChatSession.count({
      where: {
        startTime: {
          [Op.gte]: oneDayAgo
        }
      }
    });

    // Отправляем статистику в ответе
    res.json({
      totalUsers,
      activeUsers,
      totalChats,
      recentChats
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Проверка статуса сервера
 * @param {object} req - объект запроса
 * @param {object} res - объект ответа
 */
exports.getHealth = (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
}; 