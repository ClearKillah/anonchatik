import React from 'react';

const CustomChannelHeader = ({ onSkip, isFullscreen, toggleFullscreen }) => {
  return (
    <div 
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 15px',
        backgroundColor: 'var(--primary-color, #2AABEE)',
        color: 'white',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        zIndex: 10
      }}
    >
      <h2 
        style={{
          fontSize: '18px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          margin: 0
        }}
      >
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="white" 
          style={{ marginRight: '8px' }}
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
        </svg>
        Анонимный чат
      </h2>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Кнопка переключения полноэкранного режима */}
        {toggleFullscreen && (
          <button 
            onClick={toggleFullscreen}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
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
        
        {/* Кнопка пропуска собеседника */}
        <button 
          onClick={onSkip}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '6px 12px',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            display: 'flex',
            alignItems: 'center',
            fontWeight: '500',
            minHeight: '36px'
          }}
        >
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="white" 
            style={{ marginRight: '6px' }}
          >
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
          </svg>
          Пропустить
        </button>
      </div>
    </div>
  );
};

export default CustomChannelHeader; 