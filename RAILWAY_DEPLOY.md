# Деплой на Railway

Это руководство поможет вам развернуть приложение Anonchatik на платформе Railway.

## Предварительные требования

1. Аккаунт на [GitHub](https://github.com/)
2. Аккаунт на [Railway](https://railway.app/)
3. Бот в Telegram, созданный через [BotFather](https://t.me/botfather)

## Шаги по деплою

### 1. Подготовка репозитория

1. Загрузите код проекта на GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/ваш-username/anonchatik.git
   git push -u origin main
   ```

### 2. Настройка проекта на Railway

1. Войдите в свой аккаунт на [Railway](https://railway.app/)
2. Нажмите кнопку "New Project"
3. Выберите "Deploy from GitHub repo"
4. Выберите ваш репозиторий с проектом Anonchatik
5. Railway автоматически определит конфигурацию проекта и начнет деплой

### 3. Настройка переменных окружения (если необходимо)

Если вам нужно добавить какие-либо переменные окружения:

1. Перейдите в ваш проект на Railway
2. Выберите вкладку "Variables"
3. Добавьте необходимые переменные окружения

### 4. Получение URL приложения

1. После успешного деплоя перейдите в раздел "Settings" вашего проекта
2. Найдите "Domains" и скопируйте URL вашего приложения (например, https://anonchatik-production.up.railway.app)

### 5. Настройка Telegram бота

1. Откройте чат с [BotFather](https://t.me/botfather)
2. Отправьте команду `/mybots` и выберите вашего бота
3. Выберите "Bot Settings" > "Menu Button" > "Configure menu button"
4. Введите текст для кнопки (например, "Открыть чат")
5. Введите URL вашего приложения на Railway
6. Настройте команды бота с помощью `/setcommands`:
   ```
   start - Запустить бота
   help - Получить помощь
   ```

### 6. Проверка работоспособности

1. Откройте вашего бота в Telegram
2. Нажмите на кнопку меню, которую вы настроили
3. Должно открыться ваше приложение Anonchatik

## Обновление приложения

При каждом пуше в ваш GitHub репозиторий, Railway автоматически обновит ваше приложение.

## Мониторинг и логи

1. В панели управления Railway выберите ваш проект
2. Перейдите во вкладку "Deployments"
3. Выберите текущий деплой для просмотра логов

## Устранение неполадок

Если у вас возникли проблемы с деплоем:

1. Проверьте логи в Railway для выявления ошибок
2. Убедитесь, что все необходимые файлы (package.json, railway.json, Procfile) присутствуют в репозитории
3. Проверьте, что все зависимости указаны в package.json

## Дополнительные ресурсы

- [Документация Railway](https://docs.railway.app/)
- [Документация Telegram Bot API](https://core.telegram.org/bots/api)
- [Документация Telegram Mini Apps](https://core.telegram.org/bots/webapps) 