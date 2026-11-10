const express = require('express');
const router = express.Router();
const { getBrands, createBrand, updateBrand, deleteBrand } = require('../controllers/brandController');
const { authenticate, requireAdmin } = require('../middlewares/auth');
const { serviceUpload } = require('../middlewares/upload');

router.get('/', getBrands);
router.post('/', authenticate, requireAdmin, serviceUpload.single('logo'), createBrand);
router.put('/:id', authenticate, requireAdmin, updateBrand);
router.delete('/:id', authenticate, requireAdmin, deleteBrand);

module.exports = router;

