const AWS = require('aws-sdk');
const env = require('./env');

AWS.config.update({
  accessKeyId: env.aws.accessKeyId,
  secretAccessKey: env.aws.secretAccessKey,
  region: env.aws.region
});

const s3 = new AWS.S3();

module.exports = s3;
