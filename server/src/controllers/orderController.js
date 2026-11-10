const { pool } = require('../config/database');

const generateOrderId = () => {
  const prefix = 'ORD';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

// POST /api/v1/orders
const createOrder = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { customer_name, customer_phone, address, village, pin_code, order_notes, payment_method, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Order items are required' });
    }

    // Validate products and stock
    let subtotal = 0;
    const validatedItems = [];
    for (const item of items) {
      const [[product]] = await conn.query(
        'SELECT id, name, sku, selling_price, stock_quantity FROM products WHERE id = ? AND is_active = 1',
        [item.product_id]
      );
      if (!product) { await conn.rollback(); return res.status(400).json({ success: false, message: `Product ${item.product_id} not found` }); }
      if (product.stock_quantity < item.quantity) {
        await conn.rollback();
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      }
      const totalPrice = product.selling_price * item.quantity;
      subtotal += totalPrice;
      validatedItems.push({ ...item, product, totalPrice });
    }

    // Find or create customer
    let customerId = null;
    const [existing] = await conn.query('SELECT id FROM customers WHERE phone = ?', [customer_phone]);
    if (existing.length > 0) {
      customerId = existing[0].id;
      await conn.query('UPDATE customers SET name=?, total_orders=total_orders+1 WHERE id=?', [customer_name, customerId]);
    } else {
      const [cust] = await conn.query(
        'INSERT INTO customers (name, phone, address, village, pin_code, total_orders) VALUES (?,?,?,?,?,1)',
        [customer_name, customer_phone, address, village || null, pin_code || null]
      );
      customerId = cust.insertId;
    }

    const orderId = generateOrderId();
    const [orderResult] = await conn.query(
      'INSERT INTO orders (order_id, customer_id, customer_name, customer_phone, address, village, pin_code, order_notes, payment_method, subtotal, total_amount) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [orderId, customerId, customer_name, customer_phone, address, village || null, pin_code || null, order_notes || null, payment_method || 'cash_at_shop', subtotal, subtotal]
    );

    // Insert items and update stock
    for (const item of validatedItems) {
      await conn.query(
        'INSERT INTO order_items (order_id, product_id, product_name, product_sku, quantity, unit_price, total_price) VALUES (?,?,?,?,?,?,?)',
        [orderResult.insertId, item.product.id, item.product.name, item.product.sku, item.quantity, item.product.selling_price, item.totalPrice]
      );
      const newStock = item.product.stock_quantity - item.quantity;
      await conn.query('UPDATE products SET stock_quantity = ? WHERE id = ?', [newStock, item.product.id]);
      await conn.query(
        'INSERT INTO inventory_transactions (product_id, transaction_type, quantity, previous_stock, new_stock, reference_id, reference_type) VALUES (?,?,?,?,?,?,?)',
        [item.product.id, 'sale', item.quantity, item.product.stock_quantity, newStock, orderResult.insertId, 'order']
      );
    }

    await conn.commit();
    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: { order_id: orderId, id: orderResult.insertId, total_amount: subtotal }
    });
  } catch (error) { await conn.rollback(); next(error); }
  finally { conn.release(); }
};

// GET /api/v1/orders (Admin)
const getOrders = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20, date_from, date_to } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = ['1=1'];
    let params = [];
    if (status) { where.push('o.status = ?'); params.push(status); }
    if (search) { where.push('(o.order_id LIKE ? OR o.customer_phone LIKE ? OR o.customer_name LIKE ?)'); params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
    if (date_from) { where.push('o.created_at >= ?'); params.push(date_from); }
    if (date_to) { where.push('o.created_at <= ?'); params.push(date_to + ' 23:59:59'); }
    const whereStr = 'WHERE ' + where.join(' AND ');
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM orders o ${whereStr}`, params);
    const [orders] = await pool.query(
      `SELECT o.* FROM orders o ${whereStr} ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    res.json({ success: true, data: orders, pagination: { total: parseInt(total), page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

// GET /api/v1/orders/:id (Admin)
const getOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isId = !isNaN(id);
    const [[order]] = await pool.query(`SELECT * FROM orders WHERE ${isId ? 'id' : 'order_id'} = ?`, [id]);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    const [items] = await pool.query(
      `SELECT oi.*, (SELECT image_path FROM product_images WHERE product_id = oi.product_id AND is_primary = 1 LIMIT 1) as product_image
       FROM order_items oi WHERE oi.order_id = ?`, [order.id]
    );
    res.json({ success: true, data: { ...order, items } });
  } catch (error) { next(error); }
};

// PUT /api/v1/orders/:id/status (Admin)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, payment_status } = req.body;
    let query = 'UPDATE orders SET status=?';
    let params = [status];
    if (payment_status) { query += ', payment_status=?'; params.push(payment_status); }
    query += ' WHERE id=?';
    params.push(id);
    await pool.query(query, params);
    res.json({ success: true, message: 'Order status updated' });
  } catch (error) { next(error); }
};

module.exports = { createOrder, getOrders, getOrder, updateOrderStatus };

