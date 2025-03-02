import React, { useEffect } from 'react';
import styled from 'styled-components';
import './App.css';

// Components
import StartScreen from './components/StartScreen';
import WaitingScreen from './components/WaitingScreen';
import ChatScreen from './components/ChatScreen';

// Hooks
import useSocket from './hooks/useSocket';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: -webkit-fill-available;
  background-color: #1f1f1f;
  color: #f5f5f5;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
`;

function App() {
  const {
    currentScreen,
    messages,
    handleFindPartner,
    handleSkipPartner,
    handleSendMessage
  } = useSocket();
  
  // Initialize Telegram Mini App
  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.expand(); // Expand app to full height
      
      // Отключаем вертикальные свайпы для предотвращения сворачивания приложения
      let cleanupFunction = null;
      
      if (typeof tg.disableVerticalSwipes === 'function') {
        tg.disableVerticalSwipes();
        console.log('Vertical swipes disabled');
      } else {
        console.log('disableVerticalSwipes method not available in this Telegram version');
        
        // Альтернативное решение для старых версий Telegram
        // Предотвращаем сворачивание приложения при свайпе вниз
        const preventSwipeCollapse = () => {
          // Создаем небольшой отступ сверху и прокручиваем к нему
          const overflow = 1; // Минимальное значение для предотвращения сворачивания
          
          // Обработчики для предотвращения сворачивания при свайпе вниз
          let touchStartY = 0;
          
          const handleTouchStart = (e) => {
            touchStartY = e.touches[0].clientY;
          };
          
          const handleTouchMove = (e) => {
            const touchY = e.touches[0].clientY;
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            
            // Если скролл в начале и свайп вниз - предотвращаем действие по умолчанию
            if (scrollTop <= overflow && touchY > touchStartY) {
              e.preventDefault();
            }
          };
          
          // Добавляем обработчики событий
          document.addEventListener('touchstart', handleTouchStart, { passive: false });
          document.addEventListener('touchmove', handleTouchMove, { passive: false });
          
          // Устанавливаем начальный скролл
          setTimeout(() => {
            window.scrollTo(0, overflow);
          }, 100);
          
          // Возвращаем функцию очистки
          return () => {
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchmove', handleTouchMove);
          };
        };
        
        // Сохраняем функцию очистки
        cleanupFunction = preventSwipeCollapse();
      }
      
      // Set colors based on Telegram theme
      if (tg.colorScheme === 'dark') {
        // Dark theme is already set by default
        tg.setHeaderColor('#1f1f1f');
        tg.setBackgroundColor('#1f1f1f');
      } else {
        // For light theme, we'll keep dark theme for now
        // You can adjust this if needed
        tg.setHeaderColor('#2AABEE');
        tg.setBackgroundColor('#f5f5f5');
      }
      
      // Notify Telegram that app is ready
      tg.ready();
      
      // Возвращаем функцию очистки
      return () => {
        if (cleanupFunction) {
          cleanupFunction();
        }
      };
    }
  }, []);
  
  return (
    <AppContainer>
      {currentScreen === 'start' && (
        <StartScreen onFindPartner={handleFindPartner} />
      )}
      
      {currentScreen === 'waiting' && (
        <WaitingScreen />
      )}
      
      {currentScreen === 'chat' && (
        <ChatScreen 
          messages={messages}
          onSendMessage={handleSendMessage}
          onSkipPartner={handleSkipPartner}
        />
      )}
    </AppContainer>
  );
}

export default App;
