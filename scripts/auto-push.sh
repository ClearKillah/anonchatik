#!/bin/bash

# Проверяем наличие изменений
if [[ -n $(git status -s) ]]; then
    echo "Обнаружены изменения. Выполняем commit и push..."
    
    # Добавляем все изменения
    git add .
    
    # Создаем commit с текущей датой и временем
    git commit -m "Auto-commit: $(date '+%Y-%m-%d %H:%M:%S')"
    
    # Отправляем изменения в репозиторий
    git push
    
    echo "Изменения успешно отправлены в репозиторий"
else
    echo "Изменений не обнаружено"
fi 