const express = require('express');
const { getCategories, getCategoryById, createCategory } = require('../controllers/category.controller');
const asyncHandler = require('../middleware/asyncHandler.middleware');

const router = express.Router();

router.get('/', asyncHandler(getCategories));
router.post('/', asyncHandler(createCategory));
router.get('/:id', asyncHandler(getCategoryById));

module.exports = router;
