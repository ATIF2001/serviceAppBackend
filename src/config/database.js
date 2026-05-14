const { Sequelize } = require('sequelize');
const env = require('./env');

const sequelize = new Sequelize(env.databaseUrl, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: env.nodeEnv === 'production' ? { ssl: { require: true, rejectUnauthorized: false } } : {}
});

module.exports = sequelize;
