const { pool } = require('../config/database');

// GET /api/v1/categories
const getCategories = async (req, res, next) => {
  try {
    const { parent_only } = req.query;
    let query = `SELECT c.*, p.name as parent_name,
      (SELECT COUNT(*) FROM products WHERE category_id = c.id AND is_active = 1) as product_count,
      (SELECT image_path FROM product_images pi2 JOIN products p2 ON pi2.product_id = p2.id 
       WHERE p2.category_id = c.id AND pi2.is_primary = 1 LIMIT 1) as sample_image
      FROM categories c LEFT JOIN categories p ON c.parent_id = p.id WHERE c.is_active = 1`;
    if (parent_only === 'true') query += ' AND c.parent_id IS NULL';
    query += ' ORDER BY c.parent_id IS NULL DESC, c.sort_order';
    const [categories] = await pool.query(query);
    
    // Build tree structure
    const parents = categories.filter(c => !c.parent_id);
    const tree = parents.map(p => ({
      ...p,
      children: categories.filter(c => c.parent_id === p.id)
    }));
    res.json({ success: true, data: tree, flat: categories });
  } catch (error) { next(error); }
};

// POST /api/v1/categories
const createCategory = async (req, res, next) => {
  try {
    const { name, description, parent_id, sort_order } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const image_path = req.file ? `/uploads/services/${req.file.filename}` : null;
    const [result] = await pool.query(
      'INSERT INTO categories (name, slug, description, parent_id, sort_order, image_path) VALUES (?,?,?,?,?,?)',
      [name, slug, description || null, parent_id || null, sort_order || 0, image_path]
    );
    res.status(201).json({ success: true, message: 'Category created', data: { id: result.insertId } });
  } catch (error) { next(error); }
};

// PUT /api/v1/categories/:id
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, parent_id, sort_order, is_active } = req.body;
    await pool.query(
      'UPDATE categories SET name=?, description=?, parent_id=?, sort_order=?, is_active=? WHERE id=?',
      [name, description || null, parent_id || null, sort_order || 0, is_active ? 1 : 0, id]
    );
    res.json({ success: true, message: 'Category updated' });
  } catch (error) { next(error); }
};

// DELETE /api/v1/categories/:id
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE categories SET is_active = 0 WHERE id = ?', [id]);
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) { next(error); }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };

