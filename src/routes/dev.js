const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

router.get("/genAdminToken", (req, res) => {
  try {
    const authorization = req.headers.authorization;

    // Валидация входных данных
    if (!authorization) {
      return res.status(400).json({
        error: "Missing parameters",
        message:
          "Both query parameter and authorization header are required",
      });
    }

    // Проверка токена разработчика
    if (authorization !== process.env.devToken) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Invalid developer authorization token",
      });
    }

    // Создание временного администратора
    const adminData = {
      id: -1,
      name: "temporary administrator",
      access: "admin",
      accessLvl: 10,
    };
    // Генерация JWT токена
    const jwtToken = jwt.sign(adminData, process.env.secretJWT, {
      expiresIn: "30m",
    });

    // Логирование для отладки (можно убрать в production)
    console.debug("Generated admin token:", jwtToken);

    // Возврат успешного ответа
    return res.status(201).json({
      message: "Your temporary admin token",
      token: jwtToken,
      expiresIn: "30 min",
    });
  } catch (error) {
    console.error("Error generating admin token:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "An error occurred while generating the admin token",
    });
  }
});

router.get("/checkToken", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    // Проверка наличия заголовка авторизации
    if (!authHeader) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Authorization header is required",
      });
    }

    // Проверка формата токена (Bearer <token>)
    const [bearer, token] = authHeader.split(" ");
    if (bearer !== "Bearer" || !token) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Authorization header must follow 'Bearer <token>' format",
      });
    }

    // Верификация токена
    const decoded = await jwt.verify(token, process.env.secretJWT);

    // Логирование для отладки
    console.debug("Token successfully verified for user:", decoded.id);

    // Возвращаем декодированные данные
    return res.status(200).json({
      status: "success",
      user: decoded,
    });
  } catch (error) {
    console.error("Token verification failed:", error.message);

    // Разные статусы для разных ошибок верификации
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: "Token Expired",
        message: "The provided token has expired",
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Invalid token",
      });
    }

    // Для всех других ошибок
    return res.status(500).json({
      error: "Internal Server Error",
      message: "An error occurred while verifying the token",
    });
  }
});

module.exports = router;
