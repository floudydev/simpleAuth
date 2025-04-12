const { DataTypes } = require('sequelize');
const sequelize = require('./db.js');
const generate_token = require('../utils/generateToken.js');

const User = sequelize.define('User', {
  // id будет включён автоматически как PRIMARY KEY
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    defaultValue: '',
    allowNull: false,
    validate: {
      isEmail: true,
    },
    unique: true, // Индекс для ускорения запросов
  },
  password: {
    type: DataTypes.STRING,
    defaultValue: '',
    allowNull: false,
    validate: {
      len: [8, 100], // Минимальная длина 8 символов
    },
  },
  uid: {
    type: DataTypes.INTEGER,
    unique: true // Индекс для ускорения запросов
  },
  balance: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  access: {
    type: DataTypes.STRING,
    defaultValue: "user"
  },
  accessLvl: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  prefix: {
    type: DataTypes.STRING,
    defaultValue: 'Пользователь'
  },
  secretToken: {
    type: DataTypes.STRING,
    defaultValue: () => generate_token(35),
  },
  lastToken: {
    type: DataTypes.STRING,
    defaultValue: "",
    allowNull: true
  }
});

module.exports = User;