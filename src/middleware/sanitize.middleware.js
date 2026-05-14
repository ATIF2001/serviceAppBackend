const sanitizeObject = obj => {
  if (!obj || typeof obj !== 'object') return;

  for (const key of Object.keys(obj)) {
    if (key.includes('$') || key.includes('.')) {
      delete obj[key];
      continue;
    }
    sanitizeObject(obj[key]);
  }
};

module.exports = (req, res, next) => {
  sanitizeObject(req.body);
  sanitizeObject(req.query);
  sanitizeObject(req.params);
  next();
};
