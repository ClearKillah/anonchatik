import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const InputArea = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 12px;
  padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px));
  background-color: #1A1A1A;
  border-top: 1px solid #333;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  min-height: 64px;
  will-change: transform;
  transition: transform 0.2s ease-out;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
`;

const Input = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #444;
  border-radius: 24px;
  outline: none;
  font-size: 16px;
  background-color: #2A2A2A;
  color: #f5f5f5;
  min-height: 44px;
  resize: none;
  -webkit-appearance: none;
  appearance: none;
  z-index: 2;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) inset;
  transition: all 0.2s ease;
  
  &:focus {
    border-color: #2AABEE;
    box-shadow: 0 1px 3px rgba(42, 171, 238, 0.2) inset, 0 0 0 1px rgba(42, 171, 238, 0.1);
    background-color: #333;
  }
  
  &::placeholder {
    color: #999;
    opacity: 0.7;
  }
`;

const SendButton = styled.button`
  background-color: #2AABEE;
  color: white;
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  min-width: 44px;
  margin-left: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  touch-action: manipulation;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #1e9ad8;
    transform: translateY(-1px);
    box-shadow: 0 3px 7px rgba(0, 0, 0, 0.25);
  }
  
  &:active {
    background-color: #1e8ac7;
    transform: scale(0.95);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }
  
  svg {
    fill: white;
    width: 20px;
    height: 20px;
    transform: rotate(45deg) translateX(-1px);
    filter: drop-shadow(0px 1px 1px rgba(0, 0, 0, 0.1));
  }
`;

const MessageInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const inputAreaRef = useRef(null);
  const inputRef = useRef(null);
  
  // Предотвращаем сворачивание приложения при взаимодействии с полем ввода
  useEffect(() => {
    if (!inputAreaRef.current) return;
    
    // Проверяем, доступен ли метод disableVerticalSwipes в Telegram API
    if (window.Telegram && window.Telegram.WebApp && 
        typeof window.Telegram.WebApp.disableVerticalSwipes === 'function') {
      // Если метод доступен, используем его (уже вызван в App.js)
      return;
    }
    
    // Альтернативное решение для области ввода
    const inputArea = inputAreaRef.current;
    let touchStartY = 0;
    
    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };
    
    const handleTouchMove = (e) => {
      const touchY = e.touches[0].clientY;
      
      // Всегда предотвращаем свайп вниз в области ввода
      if (touchY > touchStartY) {
        e.preventDefault();
      }
    };
    
    // Добавляем обработчики событий для области ввода
    inputArea.addEventListener('touchstart', handleTouchStart, { passive: false });
    inputArea.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    // Возвращаем функцию очистки
    return () => {
      inputArea.removeEventListener('touchstart', handleTouchStart);
      inputArea.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);
  
  // Обработка фокуса на поле ввода
  useEffect(() => {
    if (!inputRef.current) return;
    
    const handleFocus = () => {
      // При фокусе на поле ввода прокручиваем страницу вниз
      // чтобы избежать проблем с клавиатурой и сворачиванием
      setTimeout(() => {
        window.scrollTo(0, document.body.scrollHeight);
      }, 100);
    };
    
    const input = inputRef.current;
    input.addEventListener('focus', handleFocus);
    
    return () => {
      input.removeEventListener('focus', handleFocus);
    };
  }, []);
  
  const handleSend = () => {
    if (!message.trim()) return;
    
    onSendMessage(message.trim());
    setMessage('');
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <InputArea ref={inputAreaRef}>
      <Input
        ref={inputRef}
        type="text"
        placeholder="Введите сообщение..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        autoComplete="off"
      />
      <SendButton onClick={handleSend} aria-label="Отправить сообщение">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
        </svg>
      </SendButton>
    </InputArea>
  );
};

export default MessageInput; 