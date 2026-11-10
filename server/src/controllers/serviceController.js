const { pool } = require('../config/database');

// GET /api/v1/services
const getServices = async (req, res, next) => {
  try {
    const { category, featured } = req.query;
    let where = ['s.is_active = 1'];
    let params = [];
    if (category) { where.push('sc.slug = ?'); params.push(category); }
    if (featured === 'true') { where.push('s.is_featured = 1'); }
    const [services] = await pool.query(
      `SELECT s.*, sc.name as category_name, sc.slug as category_slug, sc.icon as category_icon
       FROM services s JOIN service_categories sc ON s.category_id = sc.id
       WHERE ${where.join(' AND ')} ORDER BY sc.sort_order, s.sort_order`,
      params
    );
    
    // Group by category
    const categories = {};
    services.forEach(s => {
      if (!categories[s.category_id]) {
        categories[s.category_id] = { id: s.category_id, name: s.category_name, slug: s.category_slug, icon: s.category_icon, services: [] };
      }
      categories[s.category_id].services.push(s);
    });
    
    res.json({ success: true, data: services, grouped: Object.values(categories) });
  } catch (error) { next(error); }
};

// GET /api/v1/services/:id
const getService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isSlug = isNaN(id);
    const [rows] = await pool.query(
      `SELECT s.*, sc.name as category_name, sc.slug as category_slug FROM services s
       JOIN service_categories sc ON s.category_id = sc.id WHERE ${isSlug ? 's.slug' : 's.id'} = ?`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, data: rows[0] });
  } catch (error) { next(error); }
};

// POST /api/v1/services (Admin)
const createService = async (req, res, next) => {
  try {
    const { category_id, name, description, short_description, starting_price, price_note, duration_estimate, is_active, is_featured, sort_order } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').substring(0, 150) + '-' + Date.now();
    const image_path = req.file ? `/uploads/services/${req.file.filename}` : null;
    const [result] = await pool.query(
      'INSERT INTO services (category_id, name, slug, description, short_description, image_path, starting_price, price_note, duration_estimate, is_active, is_featured, sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
      [category_id, name, slug, description || null, short_description || null, image_path, starting_price || 0, price_note || 'Starting price, actual cost may vary', duration_estimate || null, is_active ? 1 : 0, is_featured ? 1 : 0, sort_order || 0]
    );
    res.status(201).json({ success: true, message: 'Service created', data: { id: result.insertId } });
  } catch (error) { next(error); }
};

// PUT /api/v1/services/:id (Admin)
const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { category_id, name, description, short_description, starting_price, price_note, duration_estimate, is_active, is_featured, sort_order } = req.body;
    const image_path = req.file ? `/uploads/services/${req.file.filename}` : undefined;
    const updateFields = [category_id, name, description || null, short_description || null, starting_price || 0, price_note, duration_estimate || null, is_active ? 1 : 0, is_featured ? 1 : 0, sort_order || 0];
    let query = 'UPDATE services SET category_id=?, name=?, description=?, short_description=?, starting_price=?, price_note=?, duration_estimate=?, is_active=?, is_featured=?, sort_order=?';
    if (image_path) { query += ', image_path=?'; updateFields.push(image_path); }
    query += ' WHERE id=?';
    updateFields.push(id);
    await pool.query(query, updateFields);
    res.json({ success: true, message: 'Service updated' });
  } catch (error) { next(error); }
};

// DELETE /api/v1/services/:id (Admin)
const deleteService = async (req, res, next) => {
  try {
    await pool.query('UPDATE services SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Service deleted' });
  } catch (error) { next(error); }
};

// GET /api/v1/service-categories
const getServiceCategories = async (req, res, next) => {
  try {
    const [cats] = await pool.query(
      `SELECT sc.*, COUNT(s.id) as service_count FROM service_categories sc
       LEFT JOIN services s ON sc.id = s.category_id AND s.is_active = 1
       WHERE sc.is_active = 1 GROUP BY sc.id ORDER BY sc.sort_order`
    );
    res.json({ success: true, data: cats });
  } catch (error) { next(error); }
};

module.exports = { getServices, getService, createService, updateService, deleteService, getServiceCategories };

