const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
require('dotenv').config();

// Импорт базы данных и моделей
const { sequelize, testConnection } = require('./database');
const { User, ChatSession } = require('./models/User');

// Импорт маршрутов и контроллеров
const apiRoutes = require('./routes/api.routes');

// Создание приложения Express
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статические файлы для веб-приложения
app.use(express.static(path.join(__dirname, '../webapp')));

// Настройка маршрутов
app.use('/api', apiRoutes);

// Основной маршрут
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../webapp/index.html'));
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Инициализация базы данных
async function initializeDatabase() {
  try {
    // Проверка соединения с базой данных
    await testConnection();
    
    // Синхронизация моделей с базой данных
    await sequelize.sync();
    console.log('Database models synchronized');
  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1);
  }
}

// Настройка Socket.IO для чата
require('./config/socket')(io);

// Создание и настройка бота Telegram
const bot = require('./config/bot')(app);

// Запуск приложения
(async () => {
  // Инициализация базы данных
  await initializeDatabase();
  
  // Запуск сервера
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Web app URL: http://localhost:${PORT}`);
  });
})();

// Корректное завершение работы при остановке
process.once('SIGINT', () => {
  if (bot) bot.stop('SIGINT');
  server.close(() => {
    sequelize.close();
    console.log('Server stopped');
  });
});

process.once('SIGTERM', () => {
  if (bot) bot.stop('SIGTERM');
  server.close(() => {
    sequelize.close();
    console.log('Server stopped');
  });
}); 