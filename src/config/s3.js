const AWS = require('aws-sdk');
const env = require('./env');

const s3Config = {
  accessKeyId: env.aws.accessKeyId,
  secretAccessKey: env.aws.secretAccessKey,
  region: env.aws.region,
  s3ForcePathStyle: env.aws.forcePathStyle
};

if (env.aws.endpoint) {
  s3Config.endpoint = env.aws.endpoint;
}

AWS.config.update(s3Config);

const s3 = new AWS.S3(s3Config);

function getFileUrl(key) {
  if (!key) return null;

  if (env.aws.endpoint) {
    const endpoint = env.aws.endpoint.replace(/\/$/, '');

    if (env.aws.forcePathStyle) {
      return `${endpoint}/${env.aws.bucket}/${key}`;
    }

    const noProtocol = endpoint.replace(/^https?:\/\//, '');
    const protocol = endpoint.startsWith('https://') ? 'https' : 'http';
    return `${protocol}://${env.aws.bucket}.${noProtocol}/${key}`;
  }

  return `https://${env.aws.bucket}.s3.${env.aws.region}.amazonaws.com/${key}`;
}

module.exports = {
  s3,
  getFileUrl
};
