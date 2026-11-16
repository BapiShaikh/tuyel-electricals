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

const DEFAULT_BANNERS = [
  {
    title: 'Complete Electrical Solutions for Home & Business',
    subtitle: 'Shop quality electrical products and get reliable repair and installation services in Sherpur & nearby villages.',
    image_path: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1920&q=80',
    button_text: 'Explore Products',
    button_link: '/shop',
    sort_order: 1,
    is_active: 1
  },
  {
    title: 'High-Speed Ceiling Fans & Summer Coolers',
    subtitle: 'Top brands like Orient, Havells, Crompton, and Usha at unbeatable wholesale & retail prices with warranty.',
    image_path: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=1920&q=80',
    button_text: 'Shop Fans & Coolers',
    button_link: '/shop?category=ceiling-fans',
    sort_order: 2,
    is_active: 1
  },
  {
    title: 'Brighten Your Space with Energy-Saving LED Lights',
    subtitle: 'Panel lights, spotlights, decorative fixtures, and durable flood lights for residential and commercial lighting.',
    image_path: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1920&q=80',
    button_text: 'Explore LED Lighting',
    button_link: '/shop?category=led-lights',
    sort_order: 3,
    is_active: 1
  },
  {
    title: 'Expert Motor Rewinding & Appliance Repair',
    subtitle: 'Fast diagnosis and doorstep repair for water pumps, ceiling fans, inverters, and heavy motors by certified technicians.',
    image_path: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1920&q=80',
    button_text: 'Book a Repair Service',
    button_link: '/book-service',
    sort_order: 4,
    is_active: 1
  },
  {
    title: '100% Genuine Modular Switches & Flame-Retardant Cables',
    subtitle: 'Authorized dealer of Anchor, Polycab, Finolex, and Goldmedal with assured safety and quality.',
    image_path: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1920&q=80',
    button_text: 'View Wiring & Switches',
    button_link: '/shop?category=wires-cables',
    sort_order: 5,
    is_active: 1
  }
];

const seedBannersIfEmpty = async () => {
  try {
    const [[{ count }]] = await pool.query('SELECT COUNT(*) as count FROM banners');
    if (count === 0) {
      for (const b of DEFAULT_BANNERS) {
        await pool.query(
          'INSERT INTO banners (title, subtitle, image_path, button_text, button_link, sort_order, is_active) VALUES (?,?,?,?,?,?,?)',
          [b.title, b.subtitle, b.image_path, b.button_text, b.button_link, b.sort_order, b.is_active]
        );
      }
    }
  } catch (err) {
    console.error('Error seeding banners:', err);
  }
};

// GET /api/v1/banners (Public)
const getBanners = async (req, res, next) => {
  try {
    await seedBannersIfEmpty();
    const [banners] = await pool.query('SELECT * FROM banners WHERE is_active = 1 ORDER BY sort_order ASC, id ASC');
    res.json({ success: true, data: banners });
  } catch (error) { next(error); }
};

// GET /api/v1/admin/banners (Admin)
const getBannersAdmin = async (req, res, next) => {
  try {
    await seedBannersIfEmpty();
    const [banners] = await pool.query('SELECT * FROM banners ORDER BY sort_order ASC, id ASC');
    res.json({ success: true, data: banners });
  } catch (error) { next(error); }
};

// POST /api/v1/admin/banners (Admin)
const createBanner = async (req, res, next) => {
  try {
    const { title, subtitle, button_text, button_link, sort_order, is_active, image_url } = req.body;
    let image_path = null;
    if (req.file) {
      image_path = `/uploads/banners/${req.file.filename}`;
    } else if (image_url && image_url.trim()) {
      image_path = image_url.trim();
    }
    const [result] = await pool.query(
      'INSERT INTO banners (title, subtitle, image_path, button_text, button_link, sort_order, is_active) VALUES (?,?,?,?,?,?,?)',
      [
        title || '',
        subtitle || null,
        image_path,
        button_text || null,
        button_link || null,
        sort_order ? parseInt(sort_order) : 0,
        is_active === undefined || is_active === null ? 1 : (parseInt(is_active) ? 1 : 0)
      ]
    );
    res.status(201).json({ success: true, message: 'Banner created successfully', data: { id: result.insertId } });
  } catch (error) { next(error); }
};

// PUT /api/v1/admin/banners/:id (Admin)
const updateBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, subtitle, button_text, button_link, sort_order, is_active, image_url } = req.body;
    
    let imageUpdateSql = '';
    let params = [
      title || '',
      subtitle || null,
      button_text || null,
      button_link || null,
      sort_order !== undefined ? parseInt(sort_order) : 0,
      is_active !== undefined ? (parseInt(is_active) ? 1 : 0) : 1
    ];

    if (req.file) {
      imageUpdateSql = ', image_path = ?';
      params.push(`/uploads/banners/${req.file.filename}`);
    } else if (image_url && image_url.trim()) {
      imageUpdateSql = ', image_path = ?';
      params.push(image_url.trim());
    }

    params.push(id);

    await pool.query(
      `UPDATE banners SET title = ?, subtitle = ?, button_text = ?, button_link = ?, sort_order = ?, is_active = ? ${imageUpdateSql} WHERE id = ?`,
      params
    );

    res.json({ success: true, message: 'Banner updated successfully' });
  } catch (error) { next(error); }
};

// DELETE /api/v1/admin/banners/:id (Admin)
const deleteBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM banners WHERE id = ?', [id]);
    res.json({ success: true, message: 'Banner deleted successfully' });
  } catch (error) { next(error); }
};

module.exports = {
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
};

