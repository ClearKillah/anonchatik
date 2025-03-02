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

const Logo = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const LogoImage = styled.img`
  width: 100px;
  height: 100px;
  margin-bottom: 15px;
`;

const LogoTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #2AABEE;
`;

const Description = styled.p`
  text-align: center;
  margin-bottom: 40px;
  font-size: 16px;
  line-height: 1.5;
  max-width: 300px;
  padding: 0 10px;
  color: #f5f5f5;
`;

const PrimaryButton = styled.button`
  background-color: #2AABEE;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s, box-shadow 0.2s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  min-height: 48px;
  touch-action: manipulation;
  -webkit-appearance: none;
  appearance: none;
  user-select: none;
  position: relative;
  overflow: hidden;
  
  &:hover {
    background-color: #229de1;
  }
  
  &:active {
    transform: translateY(1px);
    background-color: #1e8ac7;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }
`;

const StartScreen = ({ onFindPartner }) => {
  return (
    <Container>
      <Logo>
        <LogoImage src="/img/logo.svg" alt="Anonymous Chat Logo" />
        <LogoTitle>ANONCHATIK</LogoTitle>
      </Logo>
      <Description>Общайтесь анонимно с случайными людьми прямо в Telegram!</Description>
      <PrimaryButton onClick={onFindPartner}>Найти собеседника</PrimaryButton>
    </Container>
  );
};

export default StartScreen; 