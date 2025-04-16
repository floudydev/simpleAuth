# SimpleAuth

SimpleAuth — это проект для управления аутентификацией пользователей. Он предоставляет API для регистрации, входа и управления учетными записями.

## Используемые технологии

- **Node.js** — серверная платформа.
- **Express.js** — веб-фреймворк для создания API.
- **Sequelize** — ORM для работы с базой данных.
- **SQLite** — база данных для хранения информации о пользователях.
- **JWT (JSON Web Tokens)** — для аутентификации и авторизации.
- **argon2** — для хэширования паролей.
- **Swagger** — для документирования API.

## Установка и запуск

1. Клонируйте репозиторий:
   ```bash
   git clone <repository-url>
   ```
2. Установите зависимости:
   ```bash
   npm install
   ```
3. Настройте переменные окружения в файле `.env`:
   ```
   serverPort=5000
   devToken=exampleDevToken12345
   secretJWT=exampleSecretJWT12345
   ```
4. Запустите сервер:
   ```bash
   npm start
   ```

## API Документация

Подробная документация доступна по ссылке -> https://floudy-dev.su/api/api-docs/.

### Основные API пути

#### Регистрация пользователя

- **URL:** `/api/user/register`
- **Метод:** `GET`
- **Тело запроса:**
  ```json
  {
    "name": "John Doe",
    "mail": "user@example.com",
    "password": "password123"
  }
  ```
- **Ответы:**
  - Успех:
    ```json
    {
      "message": "Successful registration. Your token has generated.",
      "token": "generated-secret-token"
    }
    ```
  - Ошибка:
    ```json
    {
      "error": "Registration error",
      "message": "The user is already registered"
    }
    ```

#### Аутентификация пользователя

- **URL:** `/api/user/auth`
- **Метод:** `GET`
- **Параметры запроса:**
  - `token` (обязательный): токен пользователя.
- **Заголовки:**
  ```
  Authorization: Bearer <jwt-token>
  ```
- **Ответы:**
  - Успех:
    ```json
    {
      "status": "success",
      "user": {
        "id": 1,
        "name": "John Doe",
        "email": "user@example.com",
        "uid": 12345,
        "balance": 100,
        "access": "user",
        "prefix": "Пользователь"
      }
    }
    ```
  - Ошибка:
    ```json
    {
      "error": "Unauthorized",
      "message": "Authorization header must follow 'Bearer <token>' format"
    }
    ```

#### Генерация нового JWT

- **URL:** `/api/user/generateJWT`
- **Метод:** `GET`
- **Параметры запроса:**
  - `token` (обязательный): текущий токен пользователя.
  - `password` (обязательный): пароль пользователя.
  - `mail` (обязательный): email пользователя.
- **Ответы:**
  - Успех:
    ```json
    {
      "message": "The JWT was successfully generated. The old token has been changed.",
      "data": {
        "jwtToken": "new-jwt-token",
        "token": "new-secret-token"
      }
    }
    ```
  - Ошибка:
    ```json
    {
      "error": "Unauthorized",
      "message": "The password is incorrect or missing"
    }
    ```

#### Перегенерация токена

- **URL:** `/api/user/regenToken`
- **Метод:** `GET`
- **Параметры запроса:**
  - `password` (обязательный): пароль пользователя.
  - `mail` (обязательный): email пользователя.
- **Ответы:**
  - Успех:
    ```json
    {
      "status": "Success regen token",
      "message": "Your token has been reissued. To log in later, you need to issue a new JWT using a new token. KEEP THE TOKEN IN A SAFE PLACE.",
      "token": "new-secret-token"
    }
    ```
  - Ошибка:
    ```json
    {
      "error": "incorrect password",
      "message": "The transmitted password is incorrect or has not been transmitted"
    }
    ```

## Контакты

Если у вас есть вопросы или предложения, свяжитесь с нами по адресу: support@example.com.
