const express = require('express');
const {
  getProviders,
  getProviderById,
  createProvider,
  updateProvider,
  deleteProvider
} = require('../controllers/provider.controller');
const asyncHandler = require('../middleware/asyncHandler.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

router.get('/', asyncHandler(getProviders));
router.get('/:id', asyncHandler(getProviderById));
router.post('/', upload.single('profileImage'), asyncHandler(createProvider));
router.put('/:id', upload.single('profileImage'), asyncHandler(updateProvider));
router.delete('/:id', asyncHandler(deleteProvider));

module.exports = router;
