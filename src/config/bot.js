const { Telegraf, Markup } = require('telegraf');
const { User } = require('../models/User');

/**
 * Настройка Telegram бота
 * @param {object} app - Express приложение
 */
module.exports = (app) => {
  const BOT_TOKEN = process.env.BOT_TOKEN || '';
  const WEBAPP_URL = process.env.WEBAPP_URL || 'https://anonchatik.up.railway.app';

  // Если токен бота не предоставлен, выходим
  if (!BOT_TOKEN) {
    console.warn('BOT_TOKEN is not provided. Bot functionality is disabled.');
    return null;
  }

  const bot = new Telegraf(BOT_TOKEN);

  // Команда /start - начало работы с ботом
  bot.start(async (ctx) => {
    try {
      const telegramId = ctx.from.id;
      
      // Создаем или обновляем запись пользователя в базе данных
      const [user, created] = await User.findOrCreate({
        where: { telegramId },
        defaults: {
          sessionId: telegramId.toString(),
          username: ctx.from.username || null,
          firstName: ctx.from.first_name || null,
          lastName: ctx.from.last_name || null,
          lastActive: new Date()
        }
      });

      if (!created && user) {
        // Обновляем информацию о пользователе
        user.username = ctx.from.username || user.username;
        user.firstName = ctx.from.first_name || user.firstName;
        user.lastName = ctx.from.last_name || user.lastName;
        user.lastActive = new Date();
        await user.save();
      }

      // Формируем кнопку для запуска веб-приложения
      const webAppButton = Markup.keyboard([
        Markup.button.webApp('Открыть анонимный чат', `${WEBAPP_URL}?id=${telegramId}`)
      ]).resize();
      
      // Отправляем стильное приветственное сообщение с кнопкой
      ctx.reply(
        'ANONCHATIK | АНОНИМНЫЙ ЧАТ\n\n' +
        'Добро пожаловать в сервис анонимного общения.\n\n' +
        'Преимущества:\n' +
        '• Полная анонимность собеседников\n' +
        '• Мгновенный поиск случайных собеседников\n' +
        '• Возможность пропустить неинтересного собеседника\n' +
        '• Безопасное общение без регистрации\n' +
        '• Современный и удобный интерфейс\n\n' +
        'Нажмите на кнопку ниже, чтобы начать общение.',
        webAppButton
      );
    } catch (error) {
      console.error('Error in start command:', error);
      ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
    }
  });

  // Команда /help - справка по боту
  bot.help((ctx) => {
    ctx.reply(
      'ANONCHATIK | СПРАВКА\n\n' +
      'Этот бот предоставляет сервис анонимного общения с случайными собеседниками.\n\n' +
      'Доступные команды:\n' +
      '/start - начать использование бота\n' +
      '/help - показать справку\n\n' +
      'Для начала общения нажмите на кнопку "Открыть анонимный чат".'
    );
  });

  // Обработка входящих сообщений
  bot.on('message', (ctx) => {
    // Если это не текстовое сообщение или команда, показываем подсказку
    if (!ctx.message.text || ctx.message.text.startsWith('/')) {
      return;
    }
    
    // Предлагаем использовать веб-приложение для чата
    const webAppButton = Markup.keyboard([
      Markup.button.webApp('Открыть анонимный чат', `${WEBAPP_URL}?id=${ctx.from.id}`)
    ]).resize();
    
    ctx.reply(
      'Для общения в анонимном чате используйте кнопку ниже:',
      webAppButton
    );
  });

  // Запускаем бота
  bot.launch().then(() => {
    console.log('Bot started successfully!');
  }).catch(err => {
    console.error('Failed to start bot:', err);
  });

  // Middleware для веб-хуков Telegram
  app.use(bot.webhookCallback('/webhook'));

  // Завершение работы бота при выключении приложения
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));

  return bot;
}; 