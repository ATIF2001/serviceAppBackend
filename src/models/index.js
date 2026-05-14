const sequelize = require('../config/database');
const User = require('./user.model');
const Category = require('./category.model');
const Service = require('./service.model');
const ServiceCategory = require('./serviceCategory.model');
const Booking = require('./booking.model');
const Review = require('./review.model');
const RecentlyViewed = require('./recentlyViewed.model');

Category.hasMany(Service, { foreignKey: 'categoryId' });
Service.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Service.belongsToMany(Category, { through: ServiceCategory, as: 'categories', foreignKey: 'serviceId' });
Category.belongsToMany(Service, { through: ServiceCategory, as: 'services', foreignKey: 'categoryId' });

User.hasMany(Service, { foreignKey: 'providerId', as: 'providedServices' });
Service.belongsTo(User, { foreignKey: 'providerId', as: 'provider' });

User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Booking, { foreignKey: 'providerId', as: 'providerBookings' });
Booking.belongsTo(User, { foreignKey: 'providerId', as: 'provider' });

Service.hasMany(Booking, { foreignKey: 'serviceId' });
Booking.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });

User.hasMany(Review, { foreignKey: 'userId' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Service.hasMany(Review, { foreignKey: 'serviceId', as: 'reviews' });
Review.belongsTo(Service, { foreignKey: 'serviceId' });

User.belongsToMany(Service, { through: RecentlyViewed, as: 'recentServices', foreignKey: 'userId' });
Service.belongsToMany(User, { through: RecentlyViewed, foreignKey: 'serviceId' });
RecentlyViewed.belongsTo(User, { foreignKey: 'userId' });
RecentlyViewed.belongsTo(Service, { foreignKey: 'serviceId' });

module.exports = {
  sequelize,
  User,
  Category,
  Service,
  Booking,
  Review,
  RecentlyViewed,
  ServiceCategory
};
