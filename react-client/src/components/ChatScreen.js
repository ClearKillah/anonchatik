import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import Message from './Message';
import MessageInput from './MessageInput';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0;
  justify-content: flex-start;
  background-color: #121212;
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  padding-top: calc(14px + env(safe-area-inset-top, 0px));
  background-color: #2AABEE;
  color: white;
  position: sticky;
  top: 0;
  z-index: 100;
  min-height: 60px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
`;

const HeaderTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  letter-spacing: 0.3px;
  
  &::before {
    content: '';
    display: inline-block;
    width: 24px;
    height: 24px;
    margin-right: 10px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-size: contain;
    filter: drop-shadow(0px 1px 1px rgba(0, 0, 0, 0.2));
  }
`;

const SkipButton = styled.button`
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 38px;
  display: flex;
  align-items: center;
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  &::before {
    content: '';
    display: inline-block;
    width: 16px;
    height: 16px;
    margin-right: 8px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-size: contain;
  }
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.25);
    transform: translateY(-1px);
  }
  
  &:active {
    background-color: rgba(255, 255, 255, 0.3);
    transform: scale(0.98) translateY(0);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  background-color: #121212;
  background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23333' fill-opacity='0.15' fill-rule='evenodd'/%3E%3C/svg%3E");
  position: relative;
  padding-bottom: 80px; /* Space for input area */
  scroll-behavior: smooth;
  
  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const ChatScreen = ({ messages, onSendMessage, onSkipPartner }) => {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Предотвращаем сворачивание приложения при скроллинге сообщений
  useEffect(() => {
    if (!messagesContainerRef.current) return;
    
    // Проверяем, доступен ли метод disableVerticalSwipes в Telegram API
    if (window.Telegram && window.Telegram.WebApp && 
        typeof window.Telegram.WebApp.disableVerticalSwipes === 'function') {
      // Если метод доступен, используем его (уже вызван в App.js)
      return;
    }
    
    // Альтернативное решение для контейнера сообщений
    const messagesContainer = messagesContainerRef.current;
    let touchStartY = 0;
    
    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };
    
    const handleTouchMove = (e) => {
      const touchY = e.touches[0].clientY;
      const scrollTop = messagesContainer.scrollTop;
      
      // Если скролл в начале и свайп вниз - предотвращаем действие по умолчанию
      if (scrollTop <= 0 && touchY > touchStartY) {
        e.preventDefault();
      }
    };
    
    // Добавляем обработчики событий для контейнера сообщений
    messagesContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
    messagesContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    // Возвращаем функцию очистки
    return () => {
      messagesContainer.removeEventListener('touchstart', handleTouchStart);
      messagesContainer.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);
  
  return (
    <Container>
      <Header>
        <HeaderTitle>Анонимный чат</HeaderTitle>
        <SkipButton onClick={onSkipPartner}>Пропустить</SkipButton>
      </Header>
      
      <MessagesContainer ref={messagesContainerRef}>
        {messages.map((message, index) => (
          <Message key={index} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      
      <MessageInput onSendMessage={onSendMessage} />
    </Container>
  );
};

export default ChatScreen; 