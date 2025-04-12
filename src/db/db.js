const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite', // Путь к файлу базы данных
  logging: false
});

module.exports = sequelize;