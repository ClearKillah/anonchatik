import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background-color: #121212;
  background-image: radial-gradient(circle at 50% 10%, #1e3a5f 0%, #121212 70%);
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23333' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E");
    opacity: 0.5;
    z-index: 0;
  }
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: fadeIn 0.8s ease-out;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const SpinnerContainer = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  margin-bottom: 30px;
`;

const Spinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid rgba(42, 171, 238, 0.1);
  border-left-color: #2AABEE;
  border-radius: 50%;
  animation: spin 1.2s linear infinite, pulse 2s ease-in-out infinite;
  box-shadow: 0 0 15px rgba(42, 171, 238, 0.2);
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  @keyframes pulse {
    0% { transform: scale(1) rotate(0deg); }
    50% { transform: scale(1.1) rotate(180deg); }
    100% { transform: scale(1) rotate(360deg); }
  }
`;

const SpinnerRing = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 80px;
  height: 80px;
  border: 2px solid transparent;
  border-top-color: rgba(42, 171, 238, 0.3);
  border-radius: 50%;
  animation: spinReverse 3s linear infinite;
  
  @keyframes spinReverse {
    to {
      transform: rotate(-360deg);
    }
  }
`;

const WaitingText = styled.p`
  margin-bottom: 16px;
  font-size: 20px;
  font-weight: 600;
  color: #f5f5f5;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  letter-spacing: 0.5px;
`;

const Hint = styled.p`
  font-size: 15px;
  color: #aaa;
  opacity: 0.9;
  margin-top: 10px;
  animation: fadeInOut 2s infinite ease-in-out;
  
  @keyframes fadeInOut {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
  }
`;

const WaitingScreen = () => {
  const containerRef = useRef(null);
  
  // Предотвращаем сворачивание приложения при взаимодействии с экраном ожидания
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Проверяем, доступен ли метод disableVerticalSwipes в Telegram API
    if (window.Telegram && window.Telegram.WebApp && 
        typeof window.Telegram.WebApp.disableVerticalSwipes === 'function') {
      // Если метод доступен, используем его (уже вызван в App.js)
      return;
    }
    
    // Альтернативное решение для контейнера
    const container = containerRef.current;
    let touchStartY = 0;
    
    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };
    
    const handleTouchMove = (e) => {
      const touchY = e.touches[0].clientY;
      
      // Если свайп вниз - предотвращаем действие по умолчанию
      if (touchY > touchStartY) {
        e.preventDefault();
      }
    };
    
    // Добавляем обработчики событий для контейнера
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    // Возвращаем функцию очистки
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);
  
  return (
    <Container ref={containerRef}>
      <ContentWrapper>
        <SpinnerContainer>
          <SpinnerRing />
          <Spinner />
        </SpinnerContainer>
        <WaitingText>Поиск собеседника...</WaitingText>
        <Hint>Пожалуйста, подождите</Hint>
      </ContentWrapper>
    </Container>
  );
};

export default WaitingScreen; 