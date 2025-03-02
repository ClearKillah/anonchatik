import { useState, useEffect } from 'react';

export const useTelegramWebApp = () => {
  const [tg, setTg] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Проверяем, доступен ли Telegram Web App API
    if (window.Telegram && window.Telegram.WebApp) {
      const webApp = window.Telegram.WebApp;
      setTg(webApp);
      
      // Устанавливаем начальное состояние полноэкранного режима
      setIsFullscreen(webApp.isFullscreen || false);
      
      // Добавляем обработчик события изменения полноэкранного режима
      if (webApp.version && parseFloat(webApp.version) >= 8.0) {
        webApp.onEvent('fullscreenChanged', (isFullscreen) => {
          setIsFullscreen(isFullscreen);
        });
      }
    }
  }, []);

  // Функция для переключения полноэкранного режима
  const toggleFullscreen = () => {
    if (!tg || !tg.version || parseFloat(tg.version) < 8.0) return;
    
    if (isFullscreen) {
      tg.exitFullscreen();
    } else {
      tg.requestFullscreen();
    }
  };

  return { tg, isFullscreen, toggleFullscreen };
}; 