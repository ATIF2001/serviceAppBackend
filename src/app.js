const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const hpp = require('hpp');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const sanitize = require('./middleware/sanitize.middleware');

const routes = require('./routes');
const errorHandler = require('./middleware/error.middleware');
const env = require('./config/env');

const app = express();
const swaggerDocument = YAML.load('./src/docs/swagger.yaml');

app.use(helmet());
app.use(cors({ origin: env.clientUrl === '*' ? true : env.clientUrl }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitize);
app.use(hpp());
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
}));

app.get('/health', (req, res) => res.status(200).json({ success: true, message: 'API is healthy' }));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api', routes);

app.use(errorHandler);

module.exports = app;
