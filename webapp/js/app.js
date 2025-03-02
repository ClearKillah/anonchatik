document.addEventListener('DOMContentLoaded', () => {
    // Инициализация Telegram Mini App
    const tg = window.Telegram.WebApp;
    tg.expand(); // Раскрываем приложение на всю высоту

    // Глобальная функция для обработки встроенного обработчика события
    window.findPartnerInline = function() {
        console.log('Global findPartnerInline function called');
        const socket = window.socket;
        
        if (!socket || !socket.connected) {
            console.log('Socket not connected in inline handler');
            alert('Соединение с сервером отсутствует. Пожалуйста, подождите...');
            return;
        }
        
        try {
            console.log('Emitting findPartner from inline handler');
            socket.emit('findPartner');
            
            // Показываем экран ожидания
            const startScreen = document.getElementById('start-screen');
            const waitingScreen = document.getElementById('waiting-screen');
            
            if (startScreen && waitingScreen) {
                startScreen.classList.remove('active');
                waitingScreen.classList.add('active');
            }
        } catch (error) {
            console.error('Error in inline handler:', error);
            alert('Произошла ошибка при поиске собеседника');
        }
    };

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
        
        // Закрываем существующее соединение, если оно есть
        if (socket) {
            console.log('Closing existing socket connection');
            socket.close();
        }
        
        // Создаем новое соединение с улучшенными опциями для автоматического переподключения
        socket = io(host, {
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
            forceNew: true,
            transports: ['websocket', 'polling']
        });
        
        // Делаем сокет глобальным для доступа из встроенных обработчиков
        window.socket = socket;

        // Добавляем дополнительное логирование соединения
        socket.on('connecting', () => {
            console.log('Socket connecting...');
        });

        // Обработка регистрации пользователя
        socket.on('connect', () => {
            console.log('Connected to server with socket ID:', socket.id);
            
            // Обновляем статусное сообщение
            const statusMessage = document.getElementById('status-message');
            if (statusMessage) {
                statusMessage.textContent = 'Подключение к серверу установлено...';
            }
            
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
            
            // Если ID не найден, генерируем временный
            if (!telegramId) {
                telegramId = 'temp_' + Math.floor(Math.random() * 1000000);
                console.log('Generated temporary ID:', telegramId);
            }
            
            // Регистрируем пользователя
            console.log('Registering user with ID:', telegramId);
            socket.emit('register', { userId: telegramId });
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

        // Дополнительное отслеживание событий socket.io для отладки
        socket.io.on("error", (error) => {
            console.error("Socket.io error:", error);
        });

        socket.io.on("reconnect_attempt", (attempt) => {
            console.log("Socket.io reconnection attempt:", attempt);
        });

        socket.io.on("reconnect", (attempt) => {
            console.log("Socket.io reconnected after", attempt, "attempts");
            
            // После успешного переподключения повторно регистрируем пользователя
            let telegramId = null;
            if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
                telegramId = tg.initDataUnsafe.user.id;
            } else {
                const urlParams = new URLSearchParams(window.location.search);
                telegramId = urlParams.get('id');
            }
            
            if (telegramId) {
                console.log('Re-registering user after reconnection:', telegramId);
                socket.emit('register', { userId: telegramId });
            }
        });

        socket.io.on("reconnect_error", (error) => {
            console.error("Socket.io reconnection error:", error);
        });

        socket.io.on("reconnect_failed", () => {
            console.error("Socket.io reconnection failed");
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
        // Получаем кнопку поиска собеседника
        const findPartnerButton = document.getElementById('find-partner-btn');
        
        // Удаляем все существующие обработчики
        const newButton = findPartnerButton.cloneNode(true);
        findPartnerButton.parentNode.replaceChild(newButton, findPartnerButton);
        
        // Создаем простую функцию для поиска собеседника
        function findPartner() {
            console.log('Find partner function called');
            
            // Визуальная обратная связь
            newButton.classList.add('btn-active');
            newButton.disabled = true;
            newButton.textContent = 'Подключение...';
            
            // Проверяем соединение
            if (!socket || !socket.connected) {
                console.log('Socket not connected, reconnecting...');
                
                // Показываем статус
                const statusMessage = document.getElementById('status-message');
                if (statusMessage) {
                    statusMessage.textContent = 'Переподключение к серверу...';
                }
                
                // Пересоздаем соединение
                initializeSocket();
                
                // Пробуем снова через 2 секунды
                setTimeout(() => {
                    if (socket && socket.connected) {
                        console.log('Socket reconnected, finding partner');
                        socket.emit('findPartner');
                        showScreen(waitingScreen);
                    } else {
                        console.error('Failed to reconnect');
                        alert('Не удалось подключиться к серверу');
                    }
                    
                    // Восстанавливаем кнопку
                    newButton.classList.remove('btn-active');
                    newButton.disabled = false;
                    newButton.textContent = 'Найти собеседника';
                }, 2000);
                
                return;
            }
            
            // Если соединение есть, отправляем запрос
            try {
                console.log('Emitting findPartner event, socket ID:', socket.id);
                socket.emit('findPartner');
                showScreen(waitingScreen);
                
                // Восстанавливаем кнопку через 1 секунду
                setTimeout(() => {
                    newButton.classList.remove('btn-active');
                    newButton.disabled = false;
                    newButton.textContent = 'Найти собеседника';
                }, 1000);
            } catch (error) {
                console.error('Error finding partner:', error);
                alert('Произошла ошибка при поиске собеседника');
                
                // Восстанавливаем кнопку
                newButton.classList.remove('btn-active');
                newButton.disabled = false;
                newButton.textContent = 'Найти собеседника';
            }
        }
        
        // Используем Telegram WebApp API для обработки нажатия
        if (tg && tg.MainButton) {
            console.log('Using Telegram MainButton for handling');
            
            // Настраиваем главную кнопку Telegram
            tg.MainButton.setText('Найти собеседника');
            tg.MainButton.show();
            tg.MainButton.onClick(findPartner);
            
            // Также добавляем обычный обработчик для страховки
            newButton.addEventListener('click', findPartner);
        } else {
            console.log('Using direct click handler');
            
            // Добавляем прямой обработчик клика
            newButton.addEventListener('click', findPartner);
            
            // Для мобильных устройств добавляем обработчик touchend
            newButton.addEventListener('touchend', function(e) {
                e.preventDefault();
                findPartner();
            });
        }

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

    // Добавляем глобальный обработчик кликов для делегирования событий
    document.addEventListener('click', function(e) {
        console.log('Document click detected on element:', e.target);
        
        const target = e.target.closest('[data-action]');
        if (!target) return;
        
        const action = target.getAttribute('data-action');
        console.log('Global click handler detected action:', action);
        
        // Обрабатываем клик на кнопку поиска собеседника
        if (action === 'find-partner') {
            console.log('Global click handler: find-partner action triggered');
            
            // Вызываем функцию поиска собеседника
            const findPartnerBtn = document.getElementById('find-partner-btn');
            if (findPartnerBtn) {
                // Симулируем клик на кнопку
                console.log('Simulating click on find-partner button');
                findPartnerBtn.click();
            } else {
                // Прямая обработка, если кнопка не найдена
                console.log('Button not found, direct handling');
                if (!socket || !socket.connected) {
                    initializeSocket();
                    setTimeout(() => {
                        if (socket && socket.connected) {
                            socket.emit('findPartner');
                            showScreen(waitingScreen);
                        }
                    }, 1500);
                } else {
                    socket.emit('findPartner');
                    showScreen(waitingScreen);
                }
            }
        }
    });

    // Проверяем, что кнопка существует и добавляем прямой обработчик
    const directButton = document.getElementById('find-partner-btn');
    if (directButton) {
        console.log('Adding direct handler to find-partner button');
        directButton.addEventListener('click', function(e) {
            console.log('Direct button click detected');
            if (!socket || !socket.connected) {
                console.log('Socket not connected in direct handler');
                initializeSocket();
                setTimeout(() => {
                    if (socket && socket.connected) {
                        socket.emit('findPartner');
                        showScreen(waitingScreen);
                    }
                }, 1500);
            } else {
                console.log('Socket connected, emitting findPartner');
                socket.emit('findPartner');
                showScreen(waitingScreen);
            }
        });
    } else {
        console.error('Find partner button not found for direct handler');
    }

    // Уведомляем Telegram, что приложение готово
    tg.ready();
}); 