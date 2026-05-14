const app = require('./app');
const env = require('./config/env');
const sequelize = require('./config/database');
require('./models');

const bootstrap = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });
  } catch (error) {
    console.error('Server failed to start:', error.message);
    process.exit(1);
  }
};

bootstrap();
