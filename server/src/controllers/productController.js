const { pool } = require('../config/database');

// GET /api/v1/products
const getProducts = async (req, res, next) => {
  try {
    const { category, brand, minPrice, maxPrice, search, featured, bestseller, page = 1, limit = 12, sort = 'created_at', order = 'DESC' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = ['p.is_active = 1'];
    let params = [];

    if (category) { where.push('(c.slug = ? OR c.parent_id = (SELECT id FROM categories WHERE slug = ?))'); params.push(category, category); }
    if (brand) { where.push('b.slug = ?'); params.push(brand); }
    if (minPrice) { where.push('p.selling_price >= ?'); params.push(parseFloat(minPrice)); }
    if (maxPrice) { where.push('p.selling_price <= ?'); params.push(parseFloat(maxPrice)); }
    if (featured === 'true') { where.push('p.is_featured = 1'); }
    if (bestseller === 'true') { where.push('p.is_bestseller = 1'); }
    if (search) {
      where.push('(p.name LIKE ? OR p.short_description LIKE ? OR p.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const allowedSort = ['created_at', 'selling_price', 'name', 'views'];
    const sortCol = allowedSort.includes(sort) ? `p.${sort}` : 'p.created_at';
    const sortOrder = order === 'ASC' ? 'ASC' : 'DESC';

    const countQuery = `SELECT COUNT(*) as total FROM products p LEFT JOIN categories c ON p.category_id = c.id LEFT JOIN brands b ON p.brand_id = b.id ${whereStr}`;
    const [[{ total }]] = await pool.query(countQuery, params);

    const dataQuery = `
      SELECT p.id, p.name, p.slug, p.sku, p.short_description, p.original_price, p.selling_price, p.discount_percent,
             p.stock_quantity, p.is_featured, p.is_bestseller, p.warranty_months, p.views,
             c.name as category_name, c.slug as category_slug,
             b.name as brand_name,
             (SELECT image_path FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1) as primary_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      ${whereStr}
      ORDER BY ${sortCol} ${sortOrder}
      LIMIT ? OFFSET ?
    `;
    const [products] = await pool.query(dataQuery, [...params, parseInt(limit), offset]);

    res.json({
      success: true,
      data: products,
      pagination: { total: parseInt(total), page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
    });
  } catch (error) { next(error); }
};

// GET /api/v1/products/:id
const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isSlug = isNaN(id);
    const [products] = await pool.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug, b.name as brand_name
       FROM products p LEFT JOIN categories c ON p.category_id = c.id LEFT JOIN brands b ON p.brand_id = b.id
       WHERE ${isSlug ? 'p.slug' : 'p.id'} = ? AND p.is_active = 1`, [id]
    );
    if (products.length === 0) return res.status(404).json({ success: false, message: 'Product not found' });
    const product = products[0];
    const [images] = await pool.query('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order', [product.id]);
    await pool.query('UPDATE products SET views = views + 1 WHERE id = ?', [product.id]);
    res.json({ success: true, data: { ...product, images } });
  } catch (error) { next(error); }
};

// POST /api/v1/products (Admin)
const createProduct = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { name, category_id, brand_id, description, short_description, original_price, selling_price, stock_quantity,
            sku, model_number, warranty_months, warranty_description, is_featured, is_bestseller, low_stock_threshold } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').substring(0, 150) + '-' + Date.now();
    const discountPercent = original_price > 0 ? ((original_price - selling_price) / original_price * 100).toFixed(2) : 0;

    const [result] = await conn.query(
      `INSERT INTO products (name, slug, sku, model_number, category_id, brand_id, description, short_description,
        original_price, selling_price, discount_percent, stock_quantity, warranty_months, warranty_description,
        is_featured, is_bestseller, low_stock_threshold) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [name, slug, sku || null, model_number || null, category_id || null, brand_id || null, description || null,
       short_description || null, original_price, selling_price, discountPercent, stock_quantity || 0,
       warranty_months || 0, warranty_description || null, is_featured ? 1 : 0, is_bestseller ? 1 : 0, low_stock_threshold || 5]
    );
    const productId = result.insertId;

    // Handle images
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        await conn.query(
          'INSERT INTO product_images (product_id, image_path, is_primary, sort_order) VALUES (?,?,?,?)',
          [productId, `/uploads/products/${req.files[i].filename}`, i === 0 ? 1 : 0, i]
        );
      }
    }

    // Record inventory
    if (stock_quantity > 0) {
      await conn.query(
        'INSERT INTO inventory_transactions (product_id, transaction_type, quantity, previous_stock, new_stock, notes, created_by) VALUES (?,?,?,?,?,?,?)',
        [productId, 'purchase', stock_quantity, 0, stock_quantity, 'Initial stock', req.user.id]
      );
    }

    await conn.commit();
    res.status(201).json({ success: true, message: 'Product created successfully', data: { id: productId, slug } });
  } catch (error) { await conn.rollback(); next(error); }
  finally { conn.release(); }
};

// PUT /api/v1/products/:id (Admin)
const updateProduct = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { id } = req.params;
    const { name, category_id, brand_id, description, short_description, original_price, selling_price,
            stock_quantity, sku, model_number, warranty_months, warranty_description, is_featured, is_bestseller,
            low_stock_threshold, is_active } = req.body;

    const [[existing]] = await conn.query('SELECT * FROM products WHERE id = ?', [id]);
    if (!existing) { await conn.rollback(); return res.status(404).json({ success: false, message: 'Product not found' }); }

    const discountPercent = original_price > 0 ? ((original_price - selling_price) / original_price * 100).toFixed(2) : 0;

    await conn.query(
      `UPDATE products SET name=?, category_id=?, brand_id=?, description=?, short_description=?, original_price=?,
       selling_price=?, discount_percent=?, stock_quantity=?, sku=?, model_number=?, warranty_months=?,
       warranty_description=?, is_featured=?, is_bestseller=?, low_stock_threshold=?, is_active=? WHERE id=?`,
      [name, category_id || null, brand_id || null, description || null, short_description || null, original_price,
       selling_price, discountPercent, stock_quantity || 0, sku || null, model_number || null, warranty_months || 0,
       warranty_description || null, is_featured ? 1 : 0, is_bestseller ? 1 : 0, low_stock_threshold || 5,
       is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active, id]
    );

    // Inventory adjustment
    if (parseInt(stock_quantity) !== existing.stock_quantity) {
      const diff = parseInt(stock_quantity) - existing.stock_quantity;
      await conn.query(
        'INSERT INTO inventory_transactions (product_id, transaction_type, quantity, previous_stock, new_stock, notes, created_by) VALUES (?,?,?,?,?,?,?)',
        [id, 'adjustment', Math.abs(diff), existing.stock_quantity, stock_quantity, 'Manual adjustment', req.user.id]
      );
    }

    if (req.files && req.files.length > 0) {
      const [existingImages] = await conn.query('SELECT COUNT(*) as cnt FROM product_images WHERE product_id = ?', [id]);
      for (let i = 0; i < req.files.length; i++) {
        await conn.query(
          'INSERT INTO product_images (product_id, image_path, is_primary, sort_order) VALUES (?,?,?,?)',
          [id, `/uploads/products/${req.files[i].filename}`, existingImages[0].cnt === 0 && i === 0 ? 1 : 0, existingImages[0].cnt + i]
        );
      }
    }

    await conn.commit();
    res.json({ success: true, message: 'Product updated successfully' });
  } catch (error) { await conn.rollback(); next(error); }
  finally { conn.release(); }
};

// DELETE /api/v1/products/:id (Admin)
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE products SET is_active = 0 WHERE id = ?', [id]);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) { next(error); }
};

// DELETE /api/v1/products/:id/images/:imageId
const deleteProductImage = async (req, res, next) => {
  try {
    const { id, imageId } = req.params;
    await pool.query('DELETE FROM product_images WHERE id = ? AND product_id = ?', [imageId, id]);
    res.json({ success: true, message: 'Image deleted' });
  } catch (error) { next(error); }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, deleteProductImage };

