const express = require("express");
const cors = require("cors");
const devRoute = require("./src/routes/dev");
const userRoute = require("./src/routes/user");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const sequelize = require("./src/db/db");
const winston = require("winston");

const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

const app = express();
require("dotenv").config();

// Настройка логирования
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/app.log" }),
  ],
});

// Переместите синхронизацию базы данных сюда
sequelize.sync().then(() => {
  logger.info("Database synchronized successfully");
}).catch((err) => {
  logger.error("Database synchronization failed:", err.message);
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // Лимит запросов
});

const whitelist = ["http://localhost:5000"]; //white list consumers
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST"],
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  credentials: true, //Credentials are cookies, authorization headers or TLS client certificates.
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "device-remember-token",
    "Access-Control-Allow-Origin",
    "Origin",
    "Accept",
    "Forwarded-Proto",
    "X-Real-IP"
  ],
};

app.use(cors(corsOptions));
app.use(limiter);
app.use(helmet());

app.use("/admin/dev", devRoute);
app.use("/user", userRoute);

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "SimpleAuth API",
      version: "1.0.0",
      description: "API documentation for SimpleAuth",
    },
    servers: [
      { url: "floudy-dev.su/api", description: "prod server" },
    ],
  },
  apis: ["src/swagger/swaggerPaths.js"], // Обновлено для использования swaggerPaths.js
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.get("/", (req, res) => {
  return res.sendStatus(200).json({
    message: "SUCCESS"
  })
});

app.listen(process.env.serverPort || 5000, () => {
  console.log(`Server running on port ${process.env.serverPort || 5000}`);
}).on("error", (err) => {
  console.error("Failed to start server:", err.message);
});
