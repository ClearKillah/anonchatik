const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

// Определение модели пользователя
const User = sequelize.define('User', {
  telegramId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    unique: true
  },
  sessionId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lastActive: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true // Добавляет createdAt и updatedAt
});

// Модель для хранения информации о чат-сессиях
const ChatSession = sequelize.define('ChatSession', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  partnerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  startTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  skipped: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true
});

// Связываем модели
User.hasMany(ChatSession, { as: 'chatSessions', foreignKey: 'userId' });

module.exports = { User, ChatSession }; 