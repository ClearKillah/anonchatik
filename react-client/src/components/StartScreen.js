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
  max-width: 320px;
  animation: fadeIn 0.8s ease-out;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const LogoImage = styled.img`
  width: 120px;
  height: 120px;
  margin-bottom: 20px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  animation: pulse 3s infinite ease-in-out;
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
`;

const LogoTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #2AABEE;
  letter-spacing: 1px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const Description = styled.p`
  text-align: center;
  margin-bottom: 50px;
  font-size: 17px;
  line-height: 1.6;
  max-width: 300px;
  padding: 0 10px;
  color: #f5f5f5;
`;

const PrimaryButton = styled.button`
  background-color: #2AABEE;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px 32px;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(42, 171, 238, 0.4);
  min-height: 56px;
  min-width: 220px;
  touch-action: manipulation;
  -webkit-appearance: none;
  appearance: none;
  user-select: none;
  position: relative;
  overflow: hidden;
  letter-spacing: 0.5px;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: 0.5s;
  }
  
  &:hover {
    background-color: #229de1;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(42, 171, 238, 0.5);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(1px);
    background-color: #1e8ac7;
    box-shadow: 0 2px 8px rgba(42, 171, 238, 0.3);
  }
`;

const StartScreen = ({ onFindPartner }) => {
  const containerRef = useRef(null);
  
  // Предотвращаем сворачивание приложения при взаимодействии с контейнером
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
  
  // Обработчик нажатия на кнопку с предотвращением сворачивания
  const handleFindPartner = (e) => {
    // Предотвращаем всплытие события, чтобы избежать сворачивания
    e.stopPropagation();
    
    // Вызываем переданный обработчик
    onFindPartner();
  };
  
  return (
    <Container ref={containerRef}>
      <ContentWrapper>
        <Logo>
          <LogoImage src="/img/logo.svg" alt="Anonymous Chat Logo" />
          <LogoTitle>ANONCHATIK</LogoTitle>
        </Logo>
        <Description>Общайтесь анонимно с случайными людьми прямо в Telegram!</Description>
        <PrimaryButton onClick={handleFindPartner}>Найти собеседника</PrimaryButton>
      </ContentWrapper>
    </Container>
  );
};

export default StartScreen; 