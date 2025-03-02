document.addEventListener('DOMContentLoaded', () => {
    // Инициализация Telegram Mini App
    const tg = window.Telegram.WebApp;
    tg.expand(); // Раскрываем приложение на всю высоту

    // Применяем цветовую схему от Telegram
    if (tg.colorScheme === 'dark') {
        document.body.classList.add('dark-theme');
    }

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
    let viewportHeight = window.innerHeight;

    // Функция для переключения экранов
    function showScreen(screen) {
        currentScreen.classList.remove('active');
        screen.classList.add('active');
        currentScreen = screen;
        
        // Если переключаемся на экран чата, прокручиваем сообщения вниз
        if (screen === chatScreen) {
            setTimeout(() => {
                messages.scrollTop = messages.scrollHeight;
            }, 100);
        }
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
        
        // Фокусируемся на поле ввода снова
        messageInput.focus();
    }

    // Обработка изменения размера окна и появления клавиатуры
    function handleResize() {
        const newHeight = window.innerHeight;
        
        // Определяем, появилась ли клавиатура (для мобильных устройств)
        if (newHeight < viewportHeight) {
            isKeyboardVisible = true;
            document.body.classList.add('keyboard-visible');
            
            // Прокручиваем к последнему сообщению с задержкой
            setTimeout(() => {
                messages.scrollTop = messages.scrollHeight;
            }, 100);
        } else {
            isKeyboardVisible = false;
            document.body.classList.remove('keyboard-visible');
        }
        
        viewportHeight = newHeight;
    }

    // Инициализация соединения с сервером
    function initializeSocket() {
        // Получаем хост из текущего URL
        const host = window.location.origin;
        console.log('Connecting to server at:', host);
        
        // Создаем новое соединение с опциями для автоматического переподключения
        socket = io(host, {
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 10000
        });

        // Обработка регистрации пользователя
        socket.on('connect', () => {
            console.log('Connected to server with socket ID:', socket.id);
            
            // Получаем ID пользователя из параметров запроса или из Telegram Mini App
            let telegramId = null;
            if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
                telegramId = tg.initDataUnsafe.user.id;
                console.log('Got Telegram ID from Mini App:', telegramId);
            } else {
                // Пытаемся получить ID из URL
                const urlParams = new URLSearchParams(window.location.search);
                telegramId = urlParams.get('id');
                console.log('Got Telegram ID from URL:', telegramId);
            }
            
            // Регистрируем пользователя
            console.log('Registering user with ID:', telegramId);
            socket.emit('register', { userId: telegramId });
            
            // Обновляем статусное сообщение
            const statusMessage = document.getElementById('status-message');
            if (statusMessage) {
                statusMessage.textContent = 'Подключение к серверу установлено...';
            }
        });

        // Подтверждение регистрации
        socket.on('registered', (data) => {
            userId = data.userId;
            console.log('Registered with ID:', userId);
            
            // Добавляем системное сообщение на стартовом экране
            const statusMessage = document.getElementById('status-message');
            if (statusMessage) {
                statusMessage.textContent = 'Вы подключены к серверу. Нажмите кнопку "Найти собеседника", чтобы начать чат.';
            }
        });

        // Обработка статуса чата
        socket.on('chatStatus', (data) => {
            console.log('Chat status:', data);
            
            if (data.status === 'waiting') {
                showScreen(waitingScreen);
                
                // Обновляем сообщение о поиске
                const waitingMessage = document.getElementById('waiting-message');
                if (waitingMessage) {
                    waitingMessage.textContent = data.message;
                }
            }
        });

        // Начало чата
        socket.on('chatStart', (data) => {
            console.log('Chat started:', data);
            
            chatId = data.chatId;
            showScreen(chatScreen);
            
            // Добавляем системное сообщение
            messages.appendChild(createSystemMessage(data.message));
            messages.scrollTop = messages.scrollHeight;
        });

        // Получение сообщения
        socket.on('message', (data) => {
            console.log('Received message:', data);
            
            // Добавляем сообщение в чат
            messages.appendChild(createMessageElement(data.message, true, data.timestamp));
            messages.scrollTop = messages.scrollHeight;
        });

        // Подтверждение отправки сообщения
        socket.on('messageSent', (data) => {
            console.log('Message sent:', data);
            
            // Добавляем отправленное сообщение в чат
            messages.appendChild(createMessageElement(data.message, false, data.timestamp));
            messages.scrollTop = messages.scrollHeight;
        });

        // Завершение чата
        socket.on('chatEnded', (data) => {
            console.log('Chat ended:', data);
            
            // Добавляем системное сообщение
            messages.appendChild(createSystemMessage(data.message));
            messages.scrollTop = messages.scrollHeight;
            
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

        // Обработка ошибок соединения
        socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            
            // Обновляем статусное сообщение
            const statusMessage = document.getElementById('status-message');
            if (statusMessage) {
                statusMessage.textContent = 'Ошибка подключения к серверу. Пытаемся переподключиться...';
            }
        });

        // Обработка ошибок сервера
        socket.on('error', (data) => {
            console.error('Server error:', data);
            if (data.message) {
                alert(data.message);
            }
        });

        // Обработка отключения
        socket.on('disconnect', (reason) => {
            console.log('Disconnected from server. Reason:', reason);
            
            // Обновляем статусное сообщение
            const statusMessage = document.getElementById('status-message');
            if (statusMessage && currentScreen === startScreen) {
                statusMessage.textContent = 'Соединение с сервером потеряно. Пытаемся переподключиться...';
            }
            
            // Если пользователь был в чате, показываем сообщение
            if (currentScreen === chatScreen) {
                messages.appendChild(createSystemMessage('Соединение с сервером потеряно. Пытаемся переподключиться...'));
                messages.scrollTop = messages.scrollHeight;
            }
        });
    }

    // Инициализация обработчиков событий
    function initializeEventListeners() {
        // Кнопка поиска собеседника
        findPartnerBtn.addEventListener('click', () => {
            console.log('Find partner button clicked');
            
            // Проверяем, установлено ли соединение
            if (!socket || !socket.connected) {
                console.error('Socket not connected');
                
                // Пытаемся переподключиться
                if (socket) {
                    socket.connect();
                } else {
                    initializeSocket();
                }
                
                // Показываем сообщение пользователю
                const statusMessage = document.getElementById('status-message');
                if (statusMessage) {
                    statusMessage.textContent = 'Переподключение к серверу...';
                }
                
                // Пробуем отправить запрос через 1 секунду
                setTimeout(() => {
                    if (socket && socket.connected) {
                        console.log('Retrying findPartner after reconnection');
                        socket.emit('findPartner');
                        
                        // Показываем экран ожидания
                        showScreen(waitingScreen);
                    } else {
                        alert('Не удалось подключиться к серверу. Пожалуйста, перезагрузите приложение.');
                    }
                }, 1000);
                
                return;
            }
            
            // Если соединение установлено, отправляем запрос на поиск собеседника
            socket.emit('findPartner');
            
            // Показываем экран ожидания сразу
            showScreen(waitingScreen);
            
            // Обновляем сообщение о поиске
            const waitingMessage = document.getElementById('waiting-message');
            if (waitingMessage) {
                waitingMessage.textContent = 'Поиск собеседника...';
            }
        });

        // Кнопка пропуска собеседника
        skipPartnerBtn.addEventListener('click', () => {
            socket.emit('skipPartner');
        });

        // Отправка сообщения
        sendMessageBtn.addEventListener('click', sendMessage);

        // Отправка сообщения по нажатию Enter
        messageInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                sendMessage();
            }
        });

        // Обработка фокуса на поле ввода
        messageInput.addEventListener('focus', () => {
            // Прокручиваем к последнему сообщению с задержкой
            setTimeout(() => {
                messages.scrollTop = messages.scrollHeight;
            }, 300);
        });

        // Обработка изменения размера окна
        window.addEventListener('resize', handleResize);

        // Обработка взаимодействия с Telegram Mini App
        tg.onEvent('viewportChanged', () => {
            // Обновляем высоту экрана при изменении размера окна
            document.body.style.height = `${tg.viewportHeight}px`;
            
            // Прокручиваем к последнему сообщению с задержкой
            if (currentScreen === chatScreen) {
                setTimeout(() => {
                    messages.scrollTop = messages.scrollHeight;
                }, 100);
            }
        });
        
        // Обработка изменения ориентации устройства
        window.addEventListener('orientationchange', () => {
            // Прокручиваем к последнему сообщению с задержкой
            setTimeout(() => {
                if (currentScreen === chatScreen) {
                    messages.scrollTop = messages.scrollHeight;
                }
            }, 300);
        });
    }

    // Инициализация приложения
    initializeSocket();
    initializeEventListeners();
    
    // Устанавливаем начальную высоту viewport
    viewportHeight = window.innerHeight;

    // Уведомляем Telegram, что приложение готово
    tg.ready();
}); 