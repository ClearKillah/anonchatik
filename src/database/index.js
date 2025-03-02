const { Sequelize } = require('sequelize');
const path = require('path');

// Инициализация Sequelize с SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.NODE_ENV === 'production' 
    ? path.join(__dirname, '../../data/production.sqlite') 
    : path.join(__dirname, '../../data/database.sqlite'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false
});

// Функция для проверки соединения с базой данных
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('SQLite connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('Unable to connect to the SQLite database:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection
}; 