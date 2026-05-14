const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Service = sequelize.define('Service', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  images: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  discountedPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  rating: { type: DataTypes.DECIMAL(3, 2), defaultValue: 0 },
  totalReviews: { type: DataTypes.INTEGER, defaultValue: 0 },
  duration: { type: DataTypes.STRING },
  location: { type: DataTypes.STRING },
  tags: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  isFeatured: { type: DataTypes.BOOLEAN, defaultValue: false },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { timestamps: true });

module.exports = Service;
