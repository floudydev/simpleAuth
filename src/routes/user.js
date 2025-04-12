const express = require("express");
const sequelize = require("../db/db");
const User = require("../db/User");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const generate_token = require("../utils/generateToken");
const { body, query, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const router = express.Router();

// Лимиты для маршрутов авторизации
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 минут
  max: 10, // максимум 10 запросов
  message: "Too many requests, please try again later.",
});

// Middleware для проверки ошибок валидации
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

router.use((req, res, next) => {
  if (!process.env.secretJWT) {
    return res.status(500).json({
      error: "Server configuration error",
      message: "JWT secret is not configured",
    });
  }
  next();
});

router.post(
  "/auth",
  authLimiter,
  [
    query("token").isString().notEmpty().withMessage("Token is required"),
    body("Authorization").optional().isString(),
  ],
  validate,
  async (req, res) => {
    try {
      const { token } = req.query;
      const authHeader = req.headers.authorization;

      if (!token || !authHeader) {
        return res.status(400).json({
          error: "Missing parameters",
          message: "Token and authorization header are required",
        });
      }

      const [bearer, tokenJwt] = authHeader.split(" ");
      if (bearer !== "Bearer" || !tokenJwt) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "Authorization header must follow 'Bearer <token>' format",
        });
      }

      const userDecoded = jwt.verify(tokenJwt, process.env.secretJWT);

      if (userDecoded.exp && Date.now() >= userDecoded.exp * 1000) {
        return res.status(401).json({
          error: "Token Expired",
          message: "The provided token has expired",
        });
      }

      console.log(userDecoded);

      if (userDecoded.token !== token) {
        return res.status(403).json({
          error: "Forbidden",
          message: "The transmitted token is not correct",
        });
      }

      if (!userDecoded.mail) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Token does not contain email information",
        });
      }

      const findUser = await User.findOne({ where: { email: userDecoded.mail } });
      if (!findUser) {
        return res.status(404).json({
          error: "Not Found",
          message: "User not found",
        });
      }

      if(token !== findUser.secretToken) {
        return res.status(403).json({
          error: "Bad Request",
          message: "The transmitted token does not match the correct one"
        })
      }

      const returnData = {
        id: findUser.id,
        name: findUser.name,
        email: findUser.email,
        uid: findUser.uid,
        balance: findUser.balance,
        access: findUser.access,
        prefix: findUser.prefix,
      };

      console.debug("successfully auth for user:", findUser.id);
      return res.status(200).json({
        status: "success",
        user: returnData,
      });
    } catch (error) {
      console.error("Token verification failed:", error.message);

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

      return res.status(500).json({
        error: "Internal Server Error",
        message: error.message || "An error occurred while verifying the token",
      });
    }
  }
);

router.post("/register", async (req, res) => {
  const { name, mail, password } = req.query;
  if (!name || !mail || !password) {
    return res.status(400).json({
      error: "Missing parameters",
      message: "name, email and password are required",
    });
  }

  await sequelize.sync();
  const findUser = await User.findOne({ where: { email: mail } });
  if (findUser) {
    return res.status(401).json({
      error: "Registration error",
      message: "The user is already registered",
    });
  }

  const passwordHashed = await argon2.hash(password);

  const newUser = await User.create({
    name: name,
    email: mail,
    password: passwordHashed,
  });

  return res.status(201).json({
    message: "Successful registration. Your token has generated.",
    token: newUser.secretToken,
  });
});

router.post("/generateJWT", async (req, res) => {
  try {
    const { token, password, mail } = req.query;
    if (!token || !password || !mail) {
      return res.status(400).json({
        error: "Missing parameters",
        message: "token, password and mail are required",
      });
    }

    await sequelize.sync();
    const findUser = await User.findOne({ where: { email: mail } });
    if (!findUser) {
      return res.status(401).json({
        error: "User undefined",
        message: "The user was not found",
      });
    }

    const correctPassword = await argon2.verify(findUser.password, password);
    if (!correctPassword) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "The password is incorrect or missing",
      });
    }

    if (findUser.secretToken !== token) {
      return res.status(403).json({
        error: "Token error",
        message: "The token is incorrect or missing",
      });
    }

    const newToken = generate_token(35);
    await sequelize.sync();
    findUser.secretToken = newToken;
    await findUser.save();
    const data = {
      id: findUser.id,
      token: newToken,
      mail: findUser.email,
    };
    const jtok = jwt.sign(data, process.env.secretJWT, {
      expiresIn: "7d",
    });

    const returnData = {
      jwtToken: jtok,
      token: newToken,
    };

    return res.status(200).json({
      message:
        "The JWT was successfully generated. The old token has been changed.",
      data: returnData,
    });
  } catch (error) {
    console.error("Database error:", error.message);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "An error occurred while processing your request",
    });
  }
});

router.post("/regenToken", async (req, res) => {
  const { password, mail } = req.query;
  if(!password || !mail) {
    return res.status(403).json({
      error: "Missing parameters",
      message: "password and mail are required"
    })
  };

  const findUser = await User.findOne({where: {email: mail}});
  if(!findUser) {
    return res.status(401).json({
      error: "Search error",
      message: "The user was not found"
    })
  }

  const correctPassword = await argon2.verify(findUser.password,password);
  console.log(correctPassword)
  if(!correctPassword) {
    return res.status(401).json({
      error: "incorrect password",
      message: "The transmitted password is incorrect or has not been transmitted"
    })
  };

  const newToken = generate_token(35)

  findUser.secretToken = newToken
  await findUser.save()

  return res.status(200).json({
    status: "Success regen token",
    message: "Your token has been reissued. To log in later, you need to issue a new JWT using a new token. KEEP THE TOKEN IN A SAFE PLACE.",
    token: newToken
  })

});

module.exports = router;
