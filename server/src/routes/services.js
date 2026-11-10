const express = require('express');
const router = express.Router();
const { getServices, getService, createService, updateService, deleteService, getServiceCategories } = require('../controllers/serviceController');
const { authenticate, requireAdmin } = require('../middlewares/auth');
const { serviceUpload } = require('../middlewares/upload');

router.get('/categories', getServiceCategories);
router.get('/', getServices);
router.get('/:id', getService);
router.post('/', authenticate, requireAdmin, serviceUpload.single('image'), createService);
router.put('/:id', authenticate, requireAdmin, serviceUpload.single('image'), updateService);
router.delete('/:id', authenticate, requireAdmin, deleteService);

module.exports = router;

