const express = require('express');
const router = express.Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, deleteProductImage } = require('../controllers/productController');
const { authenticate, requireAdmin } = require('../middlewares/auth');
const { productUpload } = require('../middlewares/upload');

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', authenticate, requireAdmin, productUpload.array('images', 10), createProduct);
router.put('/:id', authenticate, requireAdmin, productUpload.array('images', 10), updateProduct);
router.delete('/:id', authenticate, requireAdmin, deleteProduct);
router.delete('/:id/images/:imageId', authenticate, requireAdmin, deleteProductImage);

module.exports = router;

