const { pool } = require('../config/database');

// GET /api/v1/brands
const getBrands = async (req, res, next) => {
  try {
    const [brands] = await pool.query(
      `SELECT b.*, COUNT(p.id) as product_count FROM brands b
       LEFT JOIN products p ON b.id = p.brand_id AND p.is_active = 1
       WHERE b.is_active = 1 GROUP BY b.id ORDER BY b.name`
    );
    res.json({ success: true, data: brands });
  } catch (error) { next(error); }
};

const createBrand = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const logo_path = req.file ? `/uploads/services/${req.file.filename}` : null;
    const [result] = await pool.query('INSERT INTO brands (name, slug, description, logo_path) VALUES (?,?,?,?)', [name, slug, description || null, logo_path]);
    res.status(201).json({ success: true, message: 'Brand created', data: { id: result.insertId } });
  } catch (error) { next(error); }
};

const updateBrand = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;
    await pool.query('UPDATE brands SET name=?, description=?, is_active=? WHERE id=?', [name, description || null, is_active ? 1 : 0, id]);
    res.json({ success: true, message: 'Brand updated' });
  } catch (error) { next(error); }
};

const deleteBrand = async (req, res, next) => {
  try {
    await pool.query('UPDATE brands SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Brand deleted' });
  } catch (error) { next(error); }
};

module.exports = { getBrands, createBrand, updateBrand, deleteBrand };

