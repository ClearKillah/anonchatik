import React, { useState } from 'react';
import styled from 'styled-components';

const InputArea = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 10px;
  padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
  background-color: #1f1f1f;
  border-top: 1px solid #444;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  min-height: 60px;
  will-change: transform;
  transition: transform 0.2s ease-out;
  box-shadow: 0 -1px 5px rgba(0, 0, 0, 0.2);
`;

const Input = styled.input`
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #444;
  border-radius: 20px;
  outline: none;
  font-size: 16px;
  background-color: #333;
  color: #f5f5f5;
  min-height: 40px;
  resize: none;
  -webkit-appearance: none;
  appearance: none;
  z-index: 2;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) inset;
  transition: border-color 0.2s, box-shadow 0.2s;
  
  &:focus {
    border-color: #2AABEE;
    box-shadow: 0 1px 3px rgba(42, 171, 238, 0.2) inset;
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
  width: 40px;
  height: 40px;
  min-width: 40px;
  margin-left: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  touch-action: manipulation;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: background-color 0.2s, transform 0.1s, box-shadow 0.2s;
  
  &:active {
    background-color: #1e8ac7;
    transform: scale(0.95);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
  
  svg {
    fill: white;
    width: 20px;
    height: 20px;
    transform: rotate(45deg) translateX(-1px);
  }
`;

const MessageInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  
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
    <InputArea>
      <Input
        type="text"
        placeholder="Введите сообщение..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <SendButton onClick={handleSend}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
        </svg>
      </SendButton>
    </InputArea>
  );
};

export default MessageInput; 