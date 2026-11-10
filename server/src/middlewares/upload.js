const multer = require('multer');
const path = require('path');
const fs = require('fs');

const createStorage = (uploadPath) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const fullPath = path.join(__dirname, '../../uploads', uploadPath);
      if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
      cb(null, fullPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname).toLowerCase());
    }
  });
};

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only JPEG, PNG and WebP images are allowed'), false);
};

const limits = { fileSize: 5 * 1024 * 1024 }; // 5MB

const productUpload = multer({ storage: createStorage('products'), fileFilter, limits });
const serviceUpload = multer({ storage: createStorage('services'), fileFilter, limits });
const bookingUpload = multer({ storage: createStorage('bookings'), fileFilter, limits });
const bannerUpload = multer({ storage: createStorage('banners'), fileFilter, limits });

module.exports = { productUpload, serviceUpload, bookingUpload, bannerUpload };

