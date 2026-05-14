const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RecentlyViewed = sequelize.define('RecentlyViewed', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true }
}, { timestamps: true });

module.exports = RecentlyViewed;
