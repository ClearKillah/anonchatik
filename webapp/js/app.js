document.addEventListener('DOMContentLoaded', () => {
    // Инициализация Telegram Mini App
    const tg = window.Telegram.WebApp;
    
    // Раскрываем приложение на всю высоту и устанавливаем режим расширения
    tg.expand();
    tg.enableClosingConfirmation();
    
    // Определяем платформу
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                 (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    if (isIOS) {
        document.body.classList.add('ios-device');
    }
    
    // Настраиваем цвета в соответствии с темой Telegram
    if (tg.colorScheme === 'dark') {
        document.body.classList.add('dark-theme');
        // Устанавливаем цвет хедера для темной темы
        tg.setHeaderColor('#1f1f1f');
        // Устанавливаем цвет фона для темной темы
        tg.setBackgroundColor('#1f1f1f');
    } else {
        // Устанавливаем цвет хедера для светлой темы
        tg.setHeaderColor('#2AABEE');
        // Устанавливаем цвет фона для светлой темы
        tg.setBackgroundColor('#f5f5f5');
    }

    // Устанавливаем переменные CSS для высоты viewport
    const updateViewportHeight = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        document.documentElement.style.setProperty('--tg-viewport-height', `${tg.viewportHeight}px`);
        document.documentElement.style.setProperty('--tg-viewport-stable-height', `${tg.viewportStableHeight}px`);
        
        // Устанавливаем высоту для iOS Safari
        document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
        
        // Устанавливаем отступ для безопасной зоны
        document.documentElement.style.setProperty('--safe-area-inset-bottom', `${tg.viewportStableHeight - tg.viewportHeight}px`);
    };
    
    updateViewportHeight();

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
        
        // Проверяем, нужно ли группировать сообщение с предыдущим
        const lastMessage = messages.lastElementChild;
        if (lastMessage && lastMessage.classList.contains('message')) {
            const isSameType = lastMessage.classList.contains(isReceived ? 'received' : 'sent');
            
            // Если предыдущее сообщение того же типа, добавляем класс для группировки
            if (isSameType) {
                messageElement.classList.add('grouped');
                
                // Проверяем временной интервал между сообщениями
                const lastMessageTime = new Date(getMessageTimestamp(lastMessage));
                const currentMessageTime = new Date(timestamp);
                const timeDiff = (currentMessageTime - lastMessageTime) / 1000 / 60; // разница в минутах
                
                // Если прошло больше 5 минут, не группируем
                if (timeDiff > 5) {
                    messageElement.classList.remove('grouped');
                }
            }
        }
        
        return messageElement;
    }
    
    // Функция для получения временной метки сообщения
    function getMessageTimestamp(messageElement) {
        const timestampElement = messageElement.querySelector('.timestamp');
        if (!timestampElement) return new Date().toISOString();
        
        // Получаем время из элемента
        const timeText = timestampElement.textContent;
        const [hours, minutes] = timeText.split(':').map(Number);
        
        // Создаем объект даты с текущей датой и указанным временем
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        
        return date.toISOString();
    }

    // Функция для создания системного сообщения
    function createSystemMessage(message) {
        const systemMessage = document.createElement('div');
        systemMessage.classList.add('system-message');
        systemMessage.textContent = message;
        
        // Добавляем анимацию
        setTimeout(() => {
            systemMessage.classList.add('animated');
        }, 10);
        
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
        updateViewportHeight();
        
        // Определяем, видима ли клавиатура (для мобильных устройств)
        const wasKeyboardVisible = isKeyboardVisible;
        
        // Используем несколько методов для определения видимости клавиатуры
        const windowHeight = window.innerHeight;
        const viewportHeight = tg.viewportHeight;
        const viewportStableHeight = tg.viewportStableHeight;
        
        // Для iOS используем visualViewport API если доступен
        if (window.visualViewport) {
            isKeyboardVisible = window.innerHeight > window.visualViewport.height * 1.15;
            
            // Устанавливаем высоту с учетом клавиатуры
            const keyboardHeight = window.innerHeight - window.visualViewport.height;
            document.documentElement.style.setProperty('--keyboard-height', `${keyboardHeight}px`);
            
            // Устанавливаем отступ для предотвращения скачков
            const viewportOffset = Math.max(0, keyboardHeight - (window.innerHeight - viewportStableHeight));
            document.documentElement.style.setProperty('--viewport-offset', `${viewportOffset}px`);
        } else {
            // Запасной вариант для других устройств
            isKeyboardVisible = viewportStableHeight > viewportHeight * 1.15 || 
                               window.screen.height > windowHeight * 1.15;
                               
            // Устанавливаем отступ для предотвращения скачков
            const viewportOffset = Math.max(0, viewportStableHeight - viewportHeight);
            document.documentElement.style.setProperty('--viewport-offset', `${viewportOffset}px`);
        }
        
        // Если клавиатура появилась или исчезла, обновляем интерфейс
        if (wasKeyboardVisible !== isKeyboardVisible) {
            if (isKeyboardVisible) {
                // Клавиатура появилась
                document.body.classList.add('keyboard-visible');
                
                // Прокручиваем к полю ввода с задержкой
                setTimeout(scrollToInputField, 100);
            } else {
                // Клавиатура скрыта
                document.body.classList.remove('keyboard-visible');
                setTimeout(scrollMessagesToBottom, 100);
            }
        }
    }

    // Функция для прокрутки к полю ввода
    function scrollToInputField() {
        if (currentScreen === chatScreen) {
            // Прокручиваем к полю ввода с задержкой для iOS
            setTimeout(() => {
                // Фокусируемся на поле ввода
                messageInput.focus();
                
                // Для iOS используем специальный подход
                if (document.body.classList.contains('ios-device')) {
                    // Прокручиваем сообщения к нижней части
                    messages.scrollTop = messages.scrollHeight;
                    
                    // Добавляем класс для предотвращения скачков
                    document.body.classList.add('input-focused');
                } else {
                    // Для других устройств используем scrollIntoView
                    inputArea.scrollIntoView({ block: 'end', behavior: 'smooth' });
                }
                
                // Обновляем высоту viewport
                updateViewportHeight();
            }, 300); // Увеличиваем задержку для более стабильной работы
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
            const messageElement = createMessageElement(data.message, true, data.timestamp);
            messages.appendChild(messageElement);
            
            // Проверяем, нужно ли прокручивать вниз
            const shouldScroll = messages.scrollTop + messages.clientHeight >= messages.scrollHeight - 100;
            if (shouldScroll) {
                scrollMessagesToBottom();
            }
        });

        // Подтверждение отправки сообщения
        socket.on('messageSent', (data) => {
            console.log('Message sent:', data);
            
            // Добавляем отправленное сообщение в чат
            const messageElement = createMessageElement(data.message, false, data.timestamp);
            messages.appendChild(messageElement);
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
        // Обработчики событий для кнопок
        findPartnerBtn.addEventListener('click', () => {
            // Инициализируем сокет при первом нажатии на кнопку
            if (!socket) {
                initializeSocket();
            }
            
            // Отправляем запрос на поиск собеседника
            socket.emit('findPartner', { userId });
            showScreen(waitingScreen);
        });
        
        skipPartnerBtn.addEventListener('click', () => {
            if (socket && chatId) {
                socket.emit('skipPartner', { userId, chatId });
                showScreen(waitingScreen);
                
                // Очищаем сообщения
                messages.innerHTML = '';
                chatId = null;
            }
        });
        
        // Обработчик отправки сообщения
        sendMessageBtn.addEventListener('click', sendMessage);
        
        // Обработчик нажатия Enter в поле ввода
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // Обработчики фокуса и потери фокуса для поля ввода
        messageInput.addEventListener('focus', () => {
            document.body.classList.add('input-focused');
            setTimeout(scrollToInputField, 100);
        });
        
        messageInput.addEventListener('blur', () => {
            document.body.classList.remove('input-focused');
        });
        
        // Обработчик изменения размера окна
        window.addEventListener('resize', handleResize);
        
        // Обработчик изменения visualViewport для iOS
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleResize);
            window.visualViewport.addEventListener('scroll', handleResize);
        }
        
        // Обработчик изменения ориентации устройства
        window.addEventListener('orientationchange', () => {
            setTimeout(handleResize, 300);
        });
        
        // Обработчик для предотвращения скачков при скролле
        document.addEventListener('scroll', (e) => {
            if (isKeyboardVisible) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    // Инициализация приложения
    initializeEventListeners();
    
    // Инициализируем обработку размера окна
    handleResize();
    
    // Инициализируем сокет при загрузке страницы
    initializeSocket();
    
    // Показываем начальный экран
    showScreen(startScreen);
    
    // Добавляем класс для обозначения загруженного приложения
    document.body.classList.add('app-loaded');
    
    // Сообщаем Telegram, что приложение готово
    tg.ready();
}); 