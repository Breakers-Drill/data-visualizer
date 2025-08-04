# Базовый образ
FROM node:20

# Директория внутри контейнера
WORKDIR /usr/src/cloud-frontend

# Установка зависимостей
COPY package*.json ./
RUN npm install

# Копирование файлов
COPY . .

# Генерация клиента prisma и инициализация базы данных
RUN npm run build

# Открываем 4000 порт
EXPOSE 4000

# Запуск приложения при запуске контейнера
CMD ["sh", "/usr/src/cloud-frontend/scripts/start.sh"]
