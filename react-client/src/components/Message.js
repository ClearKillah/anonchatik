import React from 'react';
import styled from 'styled-components';

// Styled Components
const MessageContainer = styled.div`
  max-width: 80%;
  padding: 8px 12px;
  margin-bottom: 2px;
  border-radius: 12px;
  word-wrap: break-word;
  position: relative;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
  animation: fadeIn 0.2s ease-out;
  line-height: 1.4;
  font-size: 15px;
  align-self: ${props => props.sent ? 'flex-end' : 'flex-start'};
  background-color: ${props => props.sent ? '#056162' : '#333'};
  border-bottom-${props => props.sent ? 'right' : 'left'}-radius: 4px;
  margin-${props => props.sent ? 'left' : 'right'}: auto;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const MessageText = styled.div`
  word-break: break-word;
`;

const Timestamp = styled.div`
  font-size: 11px;
  opacity: 0.8;
  margin-top: 2px;
  text-align: right;
  margin-left: 8px;
  float: right;
  line-height: 1.2;
  margin-bottom: -2px;
`;

const SystemMessageContainer = styled.div`
  align-self: center;
  background-color: rgba(42, 171, 238, 0.15);
  color: #81D4FA;
  padding: 8px 16px;
  border-radius: 18px;
  font-size: 13px;
  margin: 12px 0;
  text-align: center;
  max-width: 85%;
  animation: slideUp 0.3s ease-out;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
  font-weight: 500;
  position: relative;
  z-index: 1;
  
  &::before {
    content: '';
    display: inline-block;
    width: 16px;
    height: 16px;
    margin-right: 6px;
    vertical-align: -3px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2381D4FA'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-size: contain;
  }
  
  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

// Format timestamp
const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

// Message component
const Message = ({ message }) => {
  if (message.type === 'system') {
    return <SystemMessageContainer>{message.text}</SystemMessageContainer>;
  }
  
  return (
    <MessageContainer sent={message.type === 'sent'}>
      <MessageText>{message.text}</MessageText>
      <Timestamp>{formatTime(message.timestamp)}</Timestamp>
    </MessageContainer>
  );
};

export default Message; 