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

const whitelist = ["http://localhost:8000", "http://localhost:8080"]; //white list consumers
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) {
      return callback(new Error("Origin not specified"), false);
    }
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
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
  ],
};

app.use(cors(corsOptions));
app.use(limiter);
app.use(helmet());

app.use("/dev", devRoute);
app.use("/api/user", userRoute);

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "SimpleAuth API",
      version: "1.0.0",
      description: "API documentation for SimpleAuth",
    },
    servers: [
      { url: "http://localhost:8080", description: "Local server" },
    ],
  },
  apis: ["src/swagger/swaggerPaths.js"], // Обновлено для использования swaggerPaths.js
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.get("/", (req, res) => {
  return res.sendStatus(200);
});

app.listen(process.env.serverPort || 8080, () => {
  console.log(`Server running on port ${process.env.serverPort || 8080}`);
}).on("error", (err) => {
  console.error("Failed to start server:", err.message);
});
