document.addEventListener('DOMContentLoaded', () => {
    // Инициализация Telegram Mini App
    const tg = window.Telegram.WebApp;
    tg.expand(); // Раскрываем приложение на всю высоту

    // Применяем цветовую схему от Telegram
    if (tg.colorScheme === 'dark') {
        document.body.classList.add('dark-theme');
    }

    // Устанавливаем переменную CSS для высоты viewport
    document.documentElement.style.setProperty('--tg-viewport-height', `${tg.viewportHeight}px`);

    // Элементы интерфейса
    const startScreen = document.getElementById('start-screen');
    const waitingScreen = document.getElementById('waiting-screen');
    const chatScreen = document.getElementById('chat-screen');
    const findPartnerBtn = document.getElementById('find-partner-btn');
    const skipPartnerBtn = document.getElementById('skip-partner-btn');
    const messages = document.getElementById('messages');
    const messageInput = document.getElementById('message-input');
    const sendMessageBtn = document.getElementById('send-message-btn');
    const inputArea = document.querySelector('.input-area');

    // Состояние приложения
    let currentScreen = startScreen;
    let socket;
    let userId = null;
    let chatId = null;
    let isKeyboardVisible = false;

    // Функция для переключения экранов
    function showScreen(screen) {
        currentScreen.classList.remove('active');
        screen.classList.add('active');
        currentScreen = screen;
        
        // Если переключаемся на экран чата, прокручиваем сообщения вниз
        if (screen === chatScreen) {
            setTimeout(() => {
                scrollMessagesToBottom();
            }, 100);
        }
    }

    // Функция для прокрутки сообщений вниз
    function scrollMessagesToBottom() {
        messages.scrollTop = messages.scrollHeight;
    }

    // Функция для создания элемента сообщения
    function createMessageElement(message, isReceived = true, timestamp = new Date().toISOString()) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', isReceived ? 'received' : 'sent');
        
        const messageText = document.createElement('div');
        messageText.classList.add('message-text');
        messageText.textContent = message;
        
        const timestampElement = document.createElement('div');
        timestampElement.classList.add('timestamp');
        
        // Форматирование времени
        const date = new Date(timestamp);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        timestampElement.textContent = `${hours}:${minutes}`;
        
        messageElement.appendChild(messageText);
        messageElement.appendChild(timestampElement);
        return messageElement;
    }

    // Функция для создания системного сообщения
    function createSystemMessage(message) {
        const systemMessage = document.createElement('div');
        systemMessage.classList.add('system-message');
        systemMessage.textContent = message;
        return systemMessage;
    }

    // Функция для отправки сообщения
    function sendMessage() {
        const message = messageInput.value.trim();
        if (!message) return;
        
        // Отправляем сообщение на сервер
        socket.emit('sendMessage', { message });
        
        // Очищаем поле ввода
        messageInput.value = '';
        
        // Фокусируемся на поле ввода
        messageInput.focus();
        
        // Прокручиваем сообщения вниз
        setTimeout(scrollMessagesToBottom, 50);
    }

    // Обработка изменения размера окна и видимости клавиатуры
    function handleResize() {
        const viewportHeight = window.innerHeight;
        document.documentElement.style.setProperty('--tg-viewport-height', `${viewportHeight}px`);
        
        // Определяем, видима ли клавиатура (для мобильных устройств)
        const wasKeyboardVisible = isKeyboardVisible;
        isKeyboardVisible = window.innerHeight < window.outerHeight * 0.8;
        
        // Если клавиатура появилась или исчезла, обновляем интерфейс
        if (wasKeyboardVisible !== isKeyboardVisible) {
            if (currentScreen === chatScreen) {
                setTimeout(scrollMessagesToBottom, 100);
            }
        }
    }

    // Инициализация соединения с сервером
    function initializeSocket() {
        // Получаем хост из текущего URL
        const host = window.location.origin;
        
        // Настройки для Socket.IO
        const options = {
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 10000
        };
        
        socket = io(host, options);

        // Обработка регистрации пользователя
        socket.on('connect', () => {
            console.log('Connected to server');
            
            // Получаем ID пользователя из параметров запроса или из Telegram Mini App
            let telegramId = null;
            if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
                telegramId = tg.initDataUnsafe.user.id;
            } else {
                // Пытаемся получить ID из URL
                const urlParams = new URLSearchParams(window.location.search);
                telegramId = urlParams.get('id');
            }
            
            // Регистрируем пользователя
            socket.emit('register', { userId: telegramId });
        });

        // Подтверждение регистрации
        socket.on('registered', (data) => {
            userId = data.userId;
            console.log('Registered with ID:', userId);
        });

        // Обработка статуса чата
        socket.on('chatStatus', (data) => {
            console.log('Chat status:', data);
            
            if (data.status === 'waiting') {
                showScreen(waitingScreen);
            }
        });

        // Начало чата
        socket.on('chatStart', (data) => {
            console.log('Chat started:', data);
            
            chatId = data.chatId;
            showScreen(chatScreen);
            
            // Добавляем системное сообщение
            messages.appendChild(createSystemMessage(data.message));
            scrollMessagesToBottom();
        });

        // Получение сообщения
        socket.on('message', (data) => {
            console.log('Received message:', data);
            
            // Добавляем сообщение в чат
            messages.appendChild(createMessageElement(data.message, true, data.timestamp));
            scrollMessagesToBottom();
        });

        // Подтверждение отправки сообщения
        socket.on('messageSent', (data) => {
            console.log('Message sent:', data);
            
            // Добавляем отправленное сообщение в чат
            messages.appendChild(createMessageElement(data.message, false, data.timestamp));
            scrollMessagesToBottom();
        });

        // Завершение чата
        socket.on('chatEnded', (data) => {
            console.log('Chat ended:', data);
            
            // Добавляем системное сообщение
            messages.appendChild(createSystemMessage(data.message));
            scrollMessagesToBottom();
            
            // Возвращаемся на начальный экран через 2 секунды
            setTimeout(() => {
                chatId = null;
                showScreen(startScreen);
                
                // Очищаем чат
                while (messages.firstChild) {
                    messages.removeChild(messages.firstChild);
                }
            }, 2000);
        });

        // Обработка ошибок
        socket.on('error', (data) => {
            console.error('Error:', data);
            if (data.message) {
                alert(data.message);
            }
        });

        // Обработка отключения
        socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });
    }

    // Инициализация обработчиков событий
    function initializeEventListeners() {
        // Кнопка поиска собеседника
        findPartnerBtn.addEventListener('click', () => {
            // Добавляем визуальный отклик
            findPartnerBtn.classList.add('active');
            setTimeout(() => {
                findPartnerBtn.classList.remove('active');
            }, 150);
            
            // Проверяем соединение с сервером
            if (socket && socket.connected) {
                socket.emit('findPartner');
            } else {
                console.log('Socket not connected, trying to reconnect...');
                // Пытаемся переподключиться
                initializeSocket();
                // Показываем сообщение пользователю
                alert('Переподключение к серверу...');
            }
        });

        // Добавляем обработчик для тач-событий на мобильных устройствах
        findPartnerBtn.addEventListener('touchstart', () => {
            findPartnerBtn.classList.add('active');
        });
        
        findPartnerBtn.addEventListener('touchend', () => {
            findPartnerBtn.classList.remove('active');
        });

        // Кнопка пропуска собеседника
        skipPartnerBtn.addEventListener('click', () => {
            socket.emit('skipPartner');
        });

        // Отправка сообщения
        sendMessageBtn.addEventListener('click', sendMessage);

        // Отправка сообщения по нажатию Enter
        messageInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault(); // Предотвращаем перенос строки
                sendMessage();
            }
        });

        // Обработка фокуса на поле ввода (для мобильных устройств)
        messageInput.addEventListener('focus', () => {
            if (currentScreen === chatScreen) {
                setTimeout(scrollMessagesToBottom, 300);
            }
        });

        // Обработка взаимодействия с Telegram Mini App
        tg.onEvent('viewportChanged', () => {
            // Обновляем высоту экрана при изменении размера окна
            document.documentElement.style.setProperty('--tg-viewport-height', `${tg.viewportHeight}px`);
            
            if (currentScreen === chatScreen) {
                setTimeout(scrollMessagesToBottom, 100);
            }
        });

        // Обработка изменения размера окна
        window.addEventListener('resize', handleResize);
        
        // Инициализируем размер при загрузке
        handleResize();
    }

    // Инициализация приложения
    initializeSocket();
    initializeEventListeners();

    // Уведомляем Telegram, что приложение готово
    tg.ready();
}); 