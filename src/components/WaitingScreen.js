import React from 'react';

const WaitingScreen = () => {
  return (
    <div className="screen">
      <div className="spinner"></div>
      <p style={{ marginBottom: '10px', fontSize: '16px', fontWeight: '500' }}>
        Поиск собеседника...
      </p>
      <p style={{ fontSize: '14px', color: 'var(--tg-theme-hint-color, #999)', opacity: '0.8' }}>
        Пожалуйста, подождите
      </p>
    </div>
  );
};

export default WaitingScreen; 