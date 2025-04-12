# Используем Node.js как базовый образ
FROM node:18

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем переменную окружения для production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Устанавливаем зависимости для production
RUN npm install --only=production

# Копируем все файлы проекта
COPY . .

# Указываем порт, который будет использоваться
EXPOSE 8080

# Запускаем приложение
CMD ["node", "index.js"]
