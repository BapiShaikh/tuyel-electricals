const express = require('express');
const router = express.Router();
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { authenticate, requireAdmin } = require('../middlewares/auth');
const { serviceUpload } = require('../middlewares/upload');

router.get('/', getCategories);
router.post('/', authenticate, requireAdmin, serviceUpload.single('image'), createCategory);
router.put('/:id', authenticate, requireAdmin, updateCategory);
router.delete('/:id', authenticate, requireAdmin, deleteCategory);

module.exports = router;

