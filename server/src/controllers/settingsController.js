const { pool } = require('../config/database');

// GET /api/v1/settings (Public - general settings)
const getPublicSettings = async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT setting_key, setting_value FROM shop_settings WHERE setting_group != 'private'");
    const settings = {};
    rows.forEach(r => settings[r.setting_key] = r.setting_value);
    res.json({ success: true, data: settings });
  } catch (error) { next(error); }
};

// GET /api/v1/admin/settings (Admin)
const getAllSettings = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM shop_settings ORDER BY setting_group, setting_key');
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};

// PUT /api/v1/admin/settings (Admin)
const updateSettings = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const settings = req.body;
    for (const [key, value] of Object.entries(settings)) {
      await conn.query(
        'INSERT INTO shop_settings (setting_key, setting_value) VALUES (?,?) ON DUPLICATE KEY UPDATE setting_value=?',
        [key, value, value]
      );
    }
    await conn.commit();
    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) { await conn.rollback(); next(error); }
  finally { conn.release(); }
};

// GET /api/v1/customers (Admin)
const getCustomers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = '1=1';
    let params = [];
    if (search) { where = '(name LIKE ? OR phone LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM customers WHERE ${where}`, params);
    const [customers] = await pool.query(`SELECT * FROM customers WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...params, parseInt(limit), offset]);
    res.json({ success: true, data: customers, pagination: { total: parseInt(total), page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

// GET /api/v1/inventory (Admin)
const getInventory = async (req, res, next) => {
  try {
    const { low_stock } = req.query;
    let where = 'p.is_active = 1';
    if (low_stock === 'true') where += ' AND p.stock_quantity <= p.low_stock_threshold';
    const [products] = await pool.query(
      `SELECT p.id, p.name, p.sku, p.stock_quantity, p.low_stock_threshold, c.name as category, b.name as brand,
              (SELECT image_path FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image
       FROM products p LEFT JOIN categories c ON p.category_id = c.id LEFT JOIN brands b ON p.brand_id = b.id
       WHERE ${where} ORDER BY p.stock_quantity ASC`
    );
    res.json({ success: true, data: products });
  } catch (error) { next(error); }
};

// GET /api/v1/banners (Public)
const getBanners = async (req, res, next) => {
  try {
    const [banners] = await pool.query('SELECT * FROM banners WHERE is_active = 1 ORDER BY sort_order');
    res.json({ success: true, data: banners });
  } catch (error) { next(error); }
};

// POST /api/v1/admin/banners (Admin)
const createBanner = async (req, res, next) => {
  try {
    const { title, subtitle, button_text, button_link, sort_order } = req.body;
    const image_path = req.file ? `/uploads/banners/${req.file.filename}` : null;
    const [result] = await pool.query(
      'INSERT INTO banners (title, subtitle, image_path, button_text, button_link, sort_order) VALUES (?,?,?,?,?,?)',
      [title, subtitle || null, image_path, button_text || null, button_link || null, sort_order || 0]
    );
    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (error) { next(error); }
};

module.exports = { getPublicSettings, getAllSettings, updateSettings, getCustomers, getInventory, getBanners, createBanner };

