const express = require('express');
const { signup, login } = require('../controllers/auth.controller');
const asyncHandler = require('../middleware/asyncHandler.middleware');
const validate = require('../middleware/validate.middleware');
const { signupValidator, loginValidator } = require('../validators/auth.validator');

const router = express.Router();

router.post('/signup', signupValidator, validate, asyncHandler(signup));
router.post('/login', loginValidator, validate, asyncHandler(login));

module.exports = router;
