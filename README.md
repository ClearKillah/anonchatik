# AnonChatik - Анонимный чат в Telegram

Проект анонимного чата для Telegram с использованием Telegram Mini App. Пользователи могут искать случайных собеседников для анонимного общения.

## Возможности

- Анонимный поиск собеседников
- Общение через интерфейс Telegram Mini App
- Возможность пропустить текущего собеседника и найти нового
- Настройка на стороне сервера

## Технологии

- **Backend**: Node.js, Express
- **Database**: SQLite с Sequelize ORM
- **Real-time**: Socket.IO
- **Telegram Bot**: Telegraf.js
- **Frontend**: HTML, CSS, JavaScript, Telegram Mini App API

## Локальная установка

### Требования

- Node.js 16+
- npm или yarn

### Шаги установки

1. Клонировать репозиторий
   ```bash
   git clone https://github.com/ваш-github/anonchatik.git
   cd anonchatik
   ```

2. Установить зависимости
   ```bash
   npm install
   ```

3. Создать .env файл на основе .env.example и заполнить переменные окружения:
   ```
   PORT=3000
   NODE_ENV=development
   BOT_TOKEN=ваш_токен_бота
   WEBAPP_URL=http://localhost:3000
   ```

4. Запустить сервер
   ```bash
   npm start
   ```

## Деплой на Railway

### Подготовка

1. Создайте аккаунт на [Railway](https://railway.app/)
2. Установите [Railway CLI](https://docs.railway.app/develop/cli) (опционально)
3. Создайте бота в Telegram через [BotFather](https://t.me/botfather) и получите токен

### Шаги деплоя

1. Создайте новый проект на Railway:
   - Через веб-интерфейс: Нажмите "New Project" и выберите "Deploy from GitHub repo"
   - Через CLI: `railway init`

2. Подключите ваш GitHub репозиторий к проекту

3. Добавьте переменные окружения в проекте Railway:
   - `NODE_ENV` = production
   - `BOT_TOKEN` = 8039344227:AAEDCP_902a3r52JIdM9REqUyPx-p2IVtxA
   - `WEBAPP_URL` = https://anonchatik-production.up.railway.app (URL вашего приложения на Railway)

4. Railway автоматически обнаружит `Procfile` и запустит ваше приложение

5. После успешного деплоя, обновите настройки вашего бота в BotFather:
   - Установите команды бота: `/setcommands`
   - Настройте веб-приложение: `/setmenubutton`

## База данных

Проект использует SQLite для хранения данных. В продакшн-окружении база данных хранится в файле `data/production.sqlite`.

### Модели данных

- **User** - информация о пользователях
  - `telegramId` - ID пользователя в Telegram
  - `sessionId` - ID сессии пользователя
  - `username` - имя пользователя в Telegram
  - `firstName` - имя пользователя
  - `lastName` - фамилия пользователя
  - `lastActive` - время последней активности

- **ChatSession** - информация о чат-сессиях
  - `userId` - ID пользователя
  - `partnerId` - ID собеседника
  - `startTime` - время начала чата
  - `endTime` - время окончания чата
  - `skipped` - флаг, был ли пропущен собеседник

## Структура проекта

```
anonchatik/
├── data/                 # Директория для хранения базы данных SQLite
├── src/
│   ├── config/           # Конфигурационные файлы
│   │   ├── socket.js     # Настройка Socket.IO
│   │   └── bot.js        # Настройка Telegram бота
│   ├── controllers/      # Контроллеры для обработки запросов
│   │   ├── api.controller.js
│   │   └── chat.controller.js
│   ├── database/         # Настройка базы данных
│   │   └── index.js      # Инициализация Sequelize
│   ├── models/           # Модели данных
│   │   └── User.js       # Модель пользователя и чат-сессии
│   ├── routes/           # Маршруты API
│   │   └── api.routes.js
│   └── index.js          # Основной файл приложения
├── webapp/               # Фронтенд для Telegram Mini App
│   ├── css/
│   ├── js/
│   └── index.html
├── .env                  # Переменные окружения (не включать в репозиторий)
├── .env.example          # Пример файла переменных окружения
├── .gitignore            # Файлы, исключаемые из Git
├── package.json          # Зависимости и скрипты
├── Procfile              # Инструкции для Railway
├── railway.json          # Конфигурация Railway
└── README.md             # Документация проекта
```

## Лицензия

MIT

## Авторы

- Ваше имя или команда 