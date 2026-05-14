const express = require('express');
const { getMe, updateMe, getProviderProfile } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const asyncHandler = require('../middleware/asyncHandler.middleware');
const upload = require('../middleware/upload.middleware');
const validate = require('../middleware/validate.middleware');
const { updateProfileValidator } = require('../validators/user.validator');

const router = express.Router();

router.get('/me', protect, asyncHandler(getMe));
router.put('/me', protect, upload.single('profileImage'), updateProfileValidator, validate, asyncHandler(updateMe));
router.get('/providers/:id', asyncHandler(getProviderProfile));

module.exports = router;
