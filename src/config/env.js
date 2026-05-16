const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || '*',
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.S3_SECRET_KEY,
    region: process.env.AWS_REGION || process.env.S3_REGION || 'us-east-1',
    bucket: process.env.AWS_S3_BUCKET || process.env.S3_BUCKET,
    endpoint: (process.env.S3_ENDPOINT || process.env.AWS_S3_ENDPOINT || '').trim() || null,
    forcePathStyle: String(process.env.S3_FORCE_PATH_STYLE || process.env.AWS_S3_FORCE_PATH_STYLE || 'false').trim().toLowerCase() === 'true'
  }
};
