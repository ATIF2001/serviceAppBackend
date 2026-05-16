const express = require('express');
const { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory } = require('../controllers/category.controller');
const asyncHandler = require('../middleware/asyncHandler.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

router.get('/', asyncHandler(getCategories));
router.post('/', upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'image', maxCount: 1 }]), asyncHandler(createCategory));
router.put('/:id', upload.fields([{ name: 'logo', maxCount: 1 }]), asyncHandler(updateCategory));
router.delete('/:id', asyncHandler(deleteCategory));
router.get('/:id', asyncHandler(getCategoryById));

module.exports = router;
