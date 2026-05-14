const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');
const { User, Category, Service } = require('../models');

const seed = async () => {
  await sequelize.sync({ force: true });

  const password = await bcrypt.hash('password123', 10);

  const provider1 = await User.create({ name: 'Ali Khan', email: 'ali.provider@example.com', phone: '+971501111111', password, role: 'provider', address: 'Dubai Marina' });
  const provider2 = await User.create({ name: 'Sara Noor', email: 'sara.provider@example.com', phone: '+971502222222', password, role: 'provider', address: 'Business Bay' });
  await User.create({ name: 'Demo User', email: 'demo.user@example.com', phone: '+971503333333', password, role: 'user', address: 'JVC' });

  const categories = await Category.bulkCreate([
    { name: 'Cleaning', slug: 'cleaning', icon: 'broom', image: 'https://dummyimage.com/cleaning.jpg', isActive: true },
    { name: 'Plumbing', slug: 'plumbing', icon: 'pipe', image: 'https://dummyimage.com/plumbing.jpg', isActive: true },
    { name: 'Electrical', slug: 'electrical', icon: 'bolt', image: 'https://dummyimage.com/electrical.jpg', isActive: true }
  ]);

  const services = await Service.bulkCreate([
    { title: 'Deep Home Cleaning', description: 'Full deep cleaning for apartment or villa', categoryId: categories[0].id, providerId: provider1.id, price: 200, discountedPrice: 170, duration: '3 hours', location: 'Dubai', tags: ['home', 'deep'], isFeatured: true, isActive: true, images: ['https://dummyimage.com/service-cleaning.jpg'] },
    { title: 'Bathroom Plumbing Fix', description: 'Leakage and blockage repair service', categoryId: categories[1].id, providerId: provider2.id, price: 120, discountedPrice: 99, duration: '1 hour', location: 'Dubai', tags: ['pipe', 'repair'], isFeatured: false, isActive: true, images: ['https://dummyimage.com/service-plumbing.jpg'] },
    { title: 'Fan & Light Installation', description: 'Install and repair lights and fans', categoryId: categories[2].id, providerId: provider1.id, price: 150, discountedPrice: 130, duration: '2 hours', location: 'Dubai', tags: ['electric', 'install'], isFeatured: true, isActive: true, images: ['https://dummyimage.com/service-electrical.jpg'] }
  ]);
  await services[0].setCategories([categories[0], categories[2]]);
  await services[1].setCategories([categories[1]]);
  await services[2].setCategories([categories[2]]);

  console.log('Seed completed successfully');
  process.exit(0);
};

seed().catch(error => {
  console.error('Seed failed:', error.message);
  process.exit(1);
});
