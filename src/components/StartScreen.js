import React from 'react';

const StartScreen = ({ onFindPartner, isFullscreen, toggleFullscreen }) => {
  return (
    <div className="screen">
      <div className="logo">
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="45" fill="#2AABEE" />
          <path d="M50 25C36.2 25 25 36.2 25 50C25 63.8 36.2 75 50 75C63.8 75 75 63.8 75 50C75 36.2 63.8 25 50 25ZM50 35C55.5 35 60 39.5 60 45C60 50.5 55.5 55 50 55C44.5 55 40 50.5 40 45C40 39.5 44.5 35 50 35ZM50 70C43.75 70 38.15 67.35 34.5 63.05C34.6 56.55 47.5 53 50 53C52.5 53 65.4 56.55 65.5 63.05C61.85 67.35 56.25 70 50 70Z" fill="white" />
        </svg>
        <h1>ANONCHATIK</h1>
      </div>
      
      <p className="description">Общайтесь анонимно с случайными людьми прямо в Telegram!</p>
      
      <button className="button" onClick={onFindPartner}>
        Найти собеседника
      </button>
      
      {/* Кнопка переключения полноэкранного режима */}
      {toggleFullscreen && (
        <button 
          className="fullscreen-toggle" 
          onClick={toggleFullscreen}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            width: '36px',
            height: '36px',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {isFullscreen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
};

export default StartScreen; 