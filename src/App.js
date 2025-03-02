import React, { useState, useEffect } from 'react';
import { StreamChat } from 'stream-chat';
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageInput,
  MessageList,
  Thread,
  Window
} from 'stream-chat-react';
import 'stream-chat-react/dist/css/index.css';

import StartScreen from './components/StartScreen';
import WaitingScreen from './components/WaitingScreen';
import CustomChannelHeader from './components/CustomChannelHeader';
import { useStreamChatTheme } from './hooks/useStreamChatTheme';
import { useTelegramWebApp } from './hooks/useTelegramWebApp';

// Получаем API ключ из переменных окружения
const apiKey = process.env.REACT_APP_STREAM_API_KEY;

const App = () => {
  const [client, setClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState('start'); // 'start', 'waiting', 'chat'
  const { theme, setTheme } = useStreamChatTheme();
  const { tg, isFullscreen, toggleFullscreen } = useTelegramWebApp();

  // Инициализация Telegram Mini App
  useEffect(() => {
    if (tg) {
      // Раскрываем приложение на всю высоту
      tg.expand();
      
      // Устанавливаем цвета в соответствии с темой Telegram
      if (tg.colorScheme === 'dark') {
        setTheme('dark');
        tg.setHeaderColor('#1f1f1f');
        tg.setBackgroundColor('#1f1f1f');
      } else {
        setTheme('light');
        tg.setHeaderColor('#2AABEE');
        tg.setBackgroundColor('#f5f5f5');
      }
      
      // Запрашиваем полноэкранный режим, если API поддерживает это
      if (tg.version && parseFloat(tg.version) >= 8.0) {
        tg.requestFullscreen();
      }
      
      // Сообщаем Telegram, что приложение готово
      tg.ready();
    }
  }, [tg, setTheme]);

  // Инициализация Stream Chat
  useEffect(() => {
    const initChat = async () => {
      try {
        const chatClient = StreamChat.getInstance(apiKey);
        
        // Получаем ID пользователя из Telegram или генерируем случайный
        let userId;
        if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
          userId = `tg-${tg.initDataUnsafe.user.id}`;
        } else {
          userId = `anonymous-${Math.floor(Math.random() * 1000000)}`;
        }
        
        // Получаем токен с сервера (в реальном приложении)
        // В этом примере используем тестовый токен
        const token = chatClient.devToken(userId);
        
        // Подключаемся к Stream Chat
        await chatClient.connectUser(
          {
            id: userId,
            name: 'Anonymous User',
            image: 'https://getstream.io/random_png/?id=cool-shadow-7&name=Anonymous+User',
          },
          token,
        );
        
        setClient(chatClient);
        setUser({ id: userId });
      } catch (error) {
        console.error('Error initializing chat client', error);
      }
    };
    
    if (!client) {
      initChat();
    }
    
    return () => {
      if (client) {
        client.disconnectUser();
      }
    };
  }, [client, tg]);

  // Функция для поиска собеседника
  const findPartner = async () => {
    if (!client || !user) return;
    
    setScreen('waiting');
    
    try {
      // В реальном приложении здесь должен быть запрос к серверу
      // для поиска собеседника и создания канала
      
      // Создаем новый канал для чата
      const channelId = `anonymous-${Math.floor(Math.random() * 1000000)}`;
      const newChannel = client.channel('messaging', channelId, {
        name: 'Anonymous Chat',
        members: [user.id],
        created_by_id: user.id,
      });
      
      await newChannel.watch();
      
      // Имитируем поиск собеседника
      setTimeout(() => {
        // Добавляем системное сообщение
        newChannel.sendMessage({
          text: 'Вы начали анонимный чат. Будьте вежливы и уважайте собеседника.',
          type: 'system',
        });
        
        setChannel(newChannel);
        setScreen('chat');
      }, 2000);
      
    } catch (error) {
      console.error('Error finding partner', error);
      setScreen('start');
    }
  };

  // Функция для пропуска текущего собеседника
  const skipPartner = async () => {
    if (channel) {
      try {
        // Отправляем сообщение о завершении чата
        await channel.sendMessage({
          text: 'Чат завершен. Собеседник покинул беседу.',
          type: 'system',
        });
        
        // Закрываем текущий канал
        await channel.stopWatching();
        
        // Сбрасываем состояние
        setChannel(null);
        setScreen('waiting');
        
        // Ищем нового собеседника
        findPartner();
      } catch (error) {
        console.error('Error skipping partner', error);
      }
    }
  };

  // Рендерим соответствующий экран
  const renderScreen = () => {
    switch (screen) {
      case 'start':
        return <StartScreen onFindPartner={findPartner} isFullscreen={isFullscreen} toggleFullscreen={toggleFullscreen} />;
      case 'waiting':
        return <WaitingScreen />;
      case 'chat':
        if (!client || !channel) return <WaitingScreen />;
        
        return (
          <Chat client={client} theme={`str-chat__theme-${theme}`}>
            <Channel channel={channel}>
              <Window>
                <CustomChannelHeader onSkip={skipPartner} isFullscreen={isFullscreen} toggleFullscreen={toggleFullscreen} />
                <MessageList />
                <MessageInput focus />
              </Window>
              <Thread />
            </Channel>
          </Chat>
        );
      default:
        return <StartScreen onFindPartner={findPartner} />;
    }
  };

  return (
    <div className="app">
      {renderScreen()}
    </div>
  );
};

export default App; 