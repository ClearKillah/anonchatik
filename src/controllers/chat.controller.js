const { User } = require('../models/User');
const { Op } = require('sequelize');

/**
 * Получение статистики чатов
 * @param {object} req - объект запроса Express
 * @param {object} res - объект ответа Express
 */
exports.getStats = async (req, res) => {
  try {
    // Получаем общее количество пользователей
    const totalUsers = await User.count();
    
    // Получаем количество активных пользователей за последние 24 часа
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeUsers = await User.count({
      where: {
        lastActive: { 
          [Op.gte]: twentyFourHoursAgo 
        }
      }
    });
    
    // Возвращаем статистику
    res.json({
      totalUsers,
      activeUsers,
      totalChats: 0, // В будущем можно добавить подсчет общего количества чатов
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}; 