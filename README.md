# Anonchatik React

Современная версия анонимного чата для Telegram Mini App, построенная на React и Stream Chat.

## Особенности

- Полноэкранный режим с поддержкой Telegram Mini App API 8.0+
- Адаптивный дизайн для мобильных устройств
- Поддержка светлой и темной темы
- Плавные анимации и современный интерфейс
- Стабильная работа с клавиатурой на мобильных устройствах

## Установка

1. Клонируйте репозиторий:
```
git clone https://github.com/yourusername/anonchatik-react.git
cd anonchatik-react
```

2. Установите зависимости:
```
npm install
```

3. Запустите приложение в режиме разработки:
```
npm start
```

4. Для сборки проекта:
```
npm run build
```

5. Для деплоя в директорию webapp:
```
npm run deploy
```

## Настройка Stream Chat

Для работы приложения необходимо получить API ключ от [Stream Chat](https://getstream.io/chat/):

1. Зарегистрируйтесь на сайте Stream Chat
2. Создайте новое приложение
3. Получите API ключ и секрет
4. Замените значение `apiKey` в файле `src/App.js` на ваш ключ

## Структура проекта

- `src/` - исходный код приложения
  - `components/` - React компоненты
  - `hooks/` - кастомные React хуки
  - `App.js` - основной компонент приложения
  - `index.js` - точка входа
  - `styles.css` - основные стили
- `public/` - статические файлы
  - `img/` - изображения
  - `index.html` - HTML шаблон

## Лицензия

ISC 