import React from 'react';
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
  background-color: #1f1f1f;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #2AABEE;
  border-radius: 50%;
  animation: spin 1s linear infinite, pulse 2s ease-in-out infinite;
  margin-bottom: 20px;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
`;

const WaitingText = styled.p`
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: 500;
  color: #f5f5f5;
`;

const Hint = styled.p`
  font-size: 14px;
  color: #999;
  opacity: 0.8;
  margin-top: 10px;
`;

const WaitingScreen = () => {
  return (
    <Container>
      <Spinner />
      <WaitingText>Поиск собеседника...</WaitingText>
      <Hint>Пожалуйста, подождите</Hint>
    </Container>
  );
};

export default WaitingScreen; 