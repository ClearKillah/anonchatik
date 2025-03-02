# Настройка Telegram Mini App

Это руководство поможет вам настроить ваше приложение Anonchatik как Telegram Mini App.

## Предварительные требования

1. Бот в Telegram, созданный через [BotFather](https://t.me/botfather)
2. Приложение, развернутое на Railway или другой платформе с доступным URL

## Шаги по настройке

### 1. Создание Telegram Mini App

1. Откройте чат с [BotFather](https://t.me/botfather)
2. Отправьте команду `/newapp`
3. Выберите бота, для которого вы хотите создать Mini App
4. Введите название приложения (например, "Anonchatik")
5. Загрузите иконку приложения (1024x1024 пикселей)
6. Введите краткое описание приложения (до 512 символов)
7. Введите URL вашего приложения (например, https://anonchatik-production.up.railway.app)

### 2. Настройка параметров Mini App

1. После создания Mini App, отправьте команду `/myapps` в BotFather
2. Выберите ваше приложение из списка
3. Вы увидите меню настроек для вашего Mini App:
   - **Edit App Link** - изменить URL приложения
   - **Edit App Name** - изменить название
   - **Edit App Description** - изменить описание
   - **Edit App Photo** - изменить иконку
   - **Edit App Settings** - дополнительные настройки

4. Выберите **Edit App Settings** для настройки дополнительных параметров:
   - **Disable Direct Access** - отключить прямой доступ к приложению
   - **Enable Settings** - включить доступ к настройкам Telegram из приложения
   - **Enable Purchases** - включить покупки в приложении
   - **Enable Statistics** - включить статистику использования

### 3. Настройка кнопки меню бота

1. Отправьте команду `/mybots` в BotFather
2. Выберите вашего бота
3. Выберите "Bot Settings" > "Menu Button"
4. Выберите "Configure menu button"
5. Введите текст для кнопки (например, "Открыть чат")
6. Введите URL вашего Mini App (например, https://t.me/ваш_бот/app)

### 4. Интеграция Telegram Mini App SDK в ваше приложение

В вашем приложении уже добавлен скрипт для Telegram Mini App SDK в файле `react-client/public/index.html`:

```html
<script src="https://telegram.org/js/telegram-web-app.js"></script>
```

Для использования SDK в компонентах React, вы можете получить доступ к объекту `window.Telegram.WebApp`:

```javascript
// Пример использования в компоненте
useEffect(() => {
  const tg = window.Telegram.WebApp;
  if (tg) {
    tg.ready(); // Сообщаем Telegram, что приложение готово
    // Получаем данные пользователя
    const user = tg.initDataUnsafe?.user;
    if (user) {
      console.log('Telegram user:', user);
      // Используйте user.id для идентификации пользователя
    }
  }
}, []);
```

### 5. Тестирование Mini App

1. Откройте вашего бота в Telegram
2. Нажмите на кнопку меню, которую вы настроили
3. Должно открыться ваше приложение Anonchatik в Telegram

### 6. Отладка Mini App

Для отладки Mini App в Telegram Desktop:

1. Откройте Telegram Desktop
2. Нажмите на кнопку меню в вашем боте
3. Нажмите правой кнопкой мыши на открывшееся приложение
4. Выберите "Inspect" для открытия инструментов разработчика

## Дополнительные возможности Telegram Mini App

### Настройка темы

Telegram Mini App SDK позволяет адаптировать ваше приложение под тему Telegram:

```javascript
const tg = window.Telegram.WebApp;
const colorScheme = tg.colorScheme; // 'light' или 'dark'
const themeParams = tg.themeParams; // Объект с цветами темы
```

### Работа с кнопкой "Назад"

```javascript
const tg = window.Telegram.WebApp;
// Показать кнопку "Назад"
tg.BackButton.show();
// Обработчик нажатия
tg.BackButton.onClick(() => {
  // Ваш код
});
// Скрыть кнопку "Назад"
tg.BackButton.hide();
```

### Работа с основной кнопкой

```javascript
const tg = window.Telegram.WebApp;
// Настройка основной кнопки
tg.MainButton.setText('Найти собеседника');
tg.MainButton.show();
// Обработчик нажатия
tg.MainButton.onClick(() => {
  // Ваш код
});
```

## Полезные ссылки

- [Документация Telegram Mini Apps](https://core.telegram.org/bots/webapps)
- [Telegram Mini App SDK](https://core.telegram.org/bots/webapps#initializing-mini-apps)
- [Примеры использования Telegram Mini App](https://github.com/TelegramMessenger/webapps-examples) 