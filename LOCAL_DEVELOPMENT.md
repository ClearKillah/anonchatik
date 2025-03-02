# Локальная разработка Anonchatik

Это руководство поможет вам настроить локальную среду разработки для приложения Anonchatik.

## Предварительные требования

1. [Node.js](https://nodejs.org/) версии 16 или выше
2. [npm](https://www.npmjs.com/) (обычно устанавливается вместе с Node.js)
3. [Git](https://git-scm.com/)

## Настройка локальной среды

### 1. Клонирование репозитория

```bash
git clone https://github.com/ваш-username/anonchatik.git
cd anonchatik
```

### 2. Установка зависимостей сервера

```bash
npm install
```

### 3. Установка зависимостей клиента

```bash
cd react-client
npm install
cd ..
```

## Запуск в режиме разработки

### 1. Запуск клиента React

```bash
# В одном терминале
cd react-client
npm start
```

Клиент будет доступен по адресу [http://localhost:3000](http://localhost:3000)

### 2. Запуск сервера

```bash
# В другом терминале
npm run dev
```

Сервер будет запущен на порту 3001 (или на порту, указанном в переменной окружения PORT).

## Структура проекта

```
anonchatik/
├── node_modules/        # Зависимости сервера
├── react-client/        # Клиентское приложение React
│   ├── node_modules/    # Зависимости клиента
│   ├── public/          # Статические файлы
│   │   ├── img/         # Изображения
│   │   └── index.html   # Главный HTML файл
│   ├── src/             # Исходный код React
│   │   ├── components/  # React компоненты
│   │   ├── hooks/       # Пользовательские хуки
│   │   ├── context/     # Контексты React
│   │   ├── App.js       # Главный компонент приложения
│   │   └── index.js     # Точка входа React
│   └── package.json     # Зависимости и скрипты клиента
├── server.js            # Серверный код (Express + Socket.IO)
├── package.json         # Зависимости и скрипты сервера
├── railway.json         # Конфигурация для Railway
├── Procfile             # Конфигурация для запуска на хостинге
└── .gitignore           # Файлы, исключенные из Git
```

## Разработка

### Клиентская часть

Клиентская часть написана на React с использованием styled-components для стилизации. Основные компоненты:

- `App.js` - Главный компонент, управляющий отображением экранов
- `StartScreen.js` - Экран начала чата
- `WaitingScreen.js` - Экран ожидания собеседника
- `ChatScreen.js` - Экран чата
- `Message.js` - Компонент сообщения
- `MessageInput.js` - Компонент ввода сообщения

Для работы с WebSocket используется хук `useSocket.js`.

### Серверная часть

Серверная часть написана на Node.js с использованием Express и Socket.IO. Основные функции:

- Обработка WebSocket соединений
- Регистрация пользователей
- Поиск собеседников
- Передача сообщений между пользователями
- Обработка отключений пользователей

## Тестирование

### Тестирование клиента

```bash
cd react-client
npm test
```

### Тестирование сервера

```bash
npm test
```

## Сборка для продакшена

```bash
# Сборка клиента
cd react-client
npm run build
cd ..

# Запуск сервера в продакшен-режиме
npm start
```

## Отладка

### Отладка клиента

1. Откройте [http://localhost:3000](http://localhost:3000) в браузере
2. Откройте инструменты разработчика (F12 или Ctrl+Shift+I)
3. Перейдите на вкладку "Console" для просмотра логов

### Отладка сервера

```bash
# Запуск сервера с отладкой
NODE_DEBUG=* npm run dev
```

## Работа с Telegram Mini App в локальной среде

Для тестирования интеграции с Telegram Mini App в локальной среде:

1. Установите [ngrok](https://ngrok.com/) для создания туннеля к локальному серверу
2. Запустите ngrok:
   ```bash
   ngrok http 3000
   ```
3. Скопируйте URL, предоставленный ngrok (например, https://1234abcd.ngrok.io)
4. Используйте этот URL в настройках вашего бота в BotFather

## Полезные команды

```bash
# Проверка синтаксиса
npm run lint

# Автоматическое исправление проблем с синтаксисом
npm run lint:fix

# Очистка кеша npm
npm cache clean --force

# Обновление зависимостей
npm update
```

## Решение проблем

### Проблема: Порт уже используется

```bash
# Найти процесс, использующий порт (например, 3000)
lsof -i :3000

# Завершить процесс
kill -9 PID
```

### Проблема: Ошибки установки зависимостей

```bash
# Удалить node_modules и package-lock.json
rm -rf node_modules package-lock.json
rm -rf react-client/node_modules react-client/package-lock.json

# Переустановить зависимости
npm install
cd react-client && npm install
``` 