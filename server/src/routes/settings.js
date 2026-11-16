const express = require('express');
const router = express.Router();
const {
  getPublicSettings,
  getAllSettings,
  updateSettings,
  getCustomers,
  getInventory,
  getBanners,
  getBannersAdmin,
  createBanner,
  updateBanner,
  deleteBanner
} = require('../controllers/settingsController');
const { authenticate, requireAdmin } = require('../middlewares/auth');
const { bannerUpload } = require('../middlewares/upload');

router.get('/settings', getPublicSettings);
router.get('/banners', getBanners);
router.get('/admin/settings', authenticate, requireAdmin, getAllSettings);
router.put('/admin/settings', authenticate, requireAdmin, updateSettings);
router.get('/admin/customers', authenticate, requireAdmin, getCustomers);
router.get('/admin/inventory', authenticate, requireAdmin, getInventory);

// Banner Routes (Admin)
router.get('/admin/banners', authenticate, requireAdmin, getBannersAdmin);
router.post('/admin/banners', authenticate, requireAdmin, bannerUpload.single('image'), createBanner);
router.put('/admin/banners/:id', authenticate, requireAdmin, bannerUpload.single('image'), updateBanner);
router.delete('/admin/banners/:id', authenticate, requireAdmin, deleteBanner);

module.exports = router;

