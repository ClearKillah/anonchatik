import { useState, useEffect } from 'react';

export const useStreamChatTheme = () => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Определяем предпочтительную тему пользователя
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Устанавливаем тему в зависимости от предпочтений пользователя
    if (prefersDarkMode) {
      setTheme('dark');
    }
    
    // Добавляем слушатель изменения темы
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setTheme(e.matches ? 'dark' : 'light');
    };
    
    // Добавляем обработчик события изменения темы
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Для старых браузеров
      mediaQuery.addListener(handleChange);
    }
    
    // Очищаем обработчик при размонтировании
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Для старых браузеров
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return { theme, setTheme };
}; 