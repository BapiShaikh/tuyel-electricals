const { pool } = require("../config/database");
const { v4: uuidv4 } = require("uuid");

const generateBookingId = () => {
  const prefix = "SB";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

// POST /api/v1/bookings
const createBooking = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const {
      customer_name,
      customer_phone,
      service_category_id,
      service_id,
      address,
      village,
      pin_code,
      preferred_date,
      preferred_time_slot,
      problem_description,
    } = req.body;

    // Validate service
    const [serviceRows] = await conn.query(
      "SELECT id FROM services WHERE id = ? AND is_active = 1",
      [service_id],
    );
    if (serviceRows.length === 0) {
      await conn.rollback();
      return res
        .status(400)
        .json({ success: false, message: "Invalid service selected" });
    }

    // Find or create customer
    let customerId = null;
    const [existing] = await conn.query(
      "SELECT id FROM customers WHERE phone = ?",
      [customer_phone],
    );
    if (existing.length > 0) {
      customerId = existing[0].id;
      await conn.query(
        "UPDATE customers SET name=?, address=?, village=?, pin_code=?, total_bookings=total_bookings+1 WHERE id=?",
        [customer_name, address, village || null, pin_code || null, customerId],
      );
    } else {
      const [cust] = await conn.query(
        "INSERT INTO customers (name, phone, address, village, pin_code, total_bookings) VALUES (?,?,?,?,?,1)",
        [
          customer_name,
          customer_phone,
          address,
          village || null,
          pin_code || null,
        ],
      );
      customerId = cust.insertId;
    }

    const bookingId = generateBookingId();
    const [result] = await conn.query(
      `INSERT INTO service_bookings (booking_id, customer_id, customer_name, customer_phone, service_category_id, service_id,
         address, village, pin_code, preferred_date, preferred_time_slot, problem_description) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        bookingId,
        customerId,
        customer_name,
        customer_phone,
        service_category_id,
        service_id,
        address,
        village || null,
        pin_code || null,
        preferred_date,
        preferred_time_slot || null,
        problem_description || null,
      ],
    );

    // Handle image upload
    if (req.file) {
      await conn.query(
        "INSERT INTO service_booking_images (booking_id, image_path) VALUES (?,?)",
        [result.insertId, `/uploads/bookings/${req.file.filename}`],
      );
    }

    // History entry
    await conn.query(
      "INSERT INTO service_booking_history (booking_id, old_status, new_status, notes) VALUES (?,?,?,?)",
      [result.insertId, null, "pending", "Booking created"],
    );

    await conn.commit();

    // Get service details for WhatsApp message
    const [serviceDetail] = await pool.query(
      "SELECT s.name as service_name, sc.name as category_name FROM services s JOIN service_categories sc ON s.category_id = sc.id WHERE s.id = ?",
      [service_id],
    );
    const [[settings]] = await pool.query(
      "SELECT setting_value FROM shop_settings WHERE setting_key = 'whatsapp_number'",
    );
    const whatsappNumber = settings ? settings.setting_value : "916294156854";
    const waMsg = encodeURIComponent(
      `🔧 *New Service Booking - TUYEL ELECTRICALS*\n\n` +
        `📋 Booking ID: ${bookingId}\n` +
        `👤 Name: ${customer_name}\n` +
        `📞 Phone: ${customer_phone}\n` +
        `🔧 Service: ${serviceDetail[0]?.category_name} - ${serviceDetail[0]?.service_name}\n` +
        `📅 Date: ${preferred_date}${preferred_time_slot ? " at " + preferred_time_slot : ""}\n` +
        `📍 Address: ${address}${village ? ", " + village : ""}${pin_code ? " - " + pin_code : ""}\n` +
        `📝 Problem: ${problem_description || "Not specified"}`,
    );

    res.status(201).json({
      success: true,
      message: "Service booking submitted successfully",
      data: {
        booking_id: bookingId,
        id: result.insertId,
        whatsapp_url: `https://wa.me/${whatsappNumber}?text=${waMsg}`,
      },
    });
  } catch (error) {
    await conn.rollback();
    next(error);
  } finally {
    conn.release();
  }
};

// GET /api/v1/bookings (Admin)
const getBookings = async (req, res, next) => {
  try {
    const {
      status,
      service_id,
      date_from,
      date_to,
      search,
      page = 1,
      limit = 20,
    } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = ["1=1"];
    let params = [];
    if (status) {
      where.push("sb.status = ?");
      params.push(status);
    }
    if (service_id) {
      where.push("sb.service_id = ?");
      params.push(service_id);
    }
    if (date_from) {
      where.push("sb.preferred_date >= ?");
      params.push(date_from);
    }
    if (date_to) {
      where.push("sb.preferred_date <= ?");
      params.push(date_to);
    }
    if (search) {
      where.push(
        "(sb.booking_id LIKE ? OR sb.customer_phone LIKE ? OR sb.customer_name LIKE ?)",
      );
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    const whereStr = "WHERE " + where.join(" AND ");
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM service_bookings sb ${whereStr}`,
      params,
    );
    const [bookings] = await pool.query(
      `SELECT sb.*, s.name as service_name, sc.name as category_name FROM service_bookings sb
       JOIN services s ON sb.service_id = s.id JOIN service_categories sc ON sb.service_category_id = sc.id
       ${whereStr} ORDER BY sb.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset],
    );
    res.json({
      success: true,
      data: bookings,
      pagination: {
        total: parseInt(total),
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/bookings/:id (Admin)
const getBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isId = !isNaN(id);
    const [rows] = await pool.query(
      `SELECT sb.*, s.name as service_name, s.starting_price, sc.name as category_name
       FROM service_bookings sb JOIN services s ON sb.service_id = s.id
       JOIN service_categories sc ON sb.service_category_id = sc.id
       WHERE ${isId ? "sb.id" : "sb.booking_id"} = ?`,
      [id],
    );
    if (rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    const booking = rows[0];
    const [images] = await pool.query(
      "SELECT * FROM service_booking_images WHERE booking_id = ?",
      [booking.id],
    );
    const [history] = await pool.query(
      "SELECT sbh.*, u.name as changed_by_name FROM service_booking_history sbh LEFT JOIN users u ON sbh.changed_by = u.id WHERE sbh.booking_id = ? ORDER BY sbh.created_at",
      [booking.id],
    );
    res.json({ success: true, data: { ...booking, images, history } });
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/bookings/:id/status (Admin)
const updateBookingStatus = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { id } = req.params;
    const {
      status,
      technician_name,
      internal_notes,
      service_charge,
      completion_date,
    } = req.body;
    const [[booking]] = await conn.query(
      "SELECT * FROM service_bookings WHERE id = ?",
      [id],
    );
    if (!booking) {
      await conn.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    await conn.query(
      "UPDATE service_bookings SET status=?, technician_name=?, internal_notes=?, service_charge=?, completion_date=? WHERE id=?",
      [
        status,
        technician_name || booking.technician_name,
        internal_notes || booking.internal_notes,
        service_charge || booking.service_charge,
        completion_date || booking.completion_date,
        id,
      ],
    );
    await conn.query(
      "INSERT INTO service_booking_history (booking_id, old_status, new_status, changed_by, notes) VALUES (?,?,?,?,?)",
      [id, booking.status, status, req.user.id, internal_notes || null],
    );
    await conn.commit();
    res.json({ success: true, message: "Booking status updated" });
  } catch (error) {
    await conn.rollback();
    next(error);
  } finally {
    conn.release();
  }
};

// GET /api/v1/bookings/track/:bookingId (Public)
const trackBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { phone } = req.query;
    const [rows] = await pool.query(
      `SELECT sb.booking_id, sb.customer_name, sb.status, sb.preferred_date, sb.preferred_time_slot,
              sb.created_at, sb.technician_name, s.name as service_name, sc.name as category_name
       FROM service_bookings sb JOIN services s ON sb.service_id = s.id
       JOIN service_categories sc ON sb.service_category_id = sc.id
       WHERE sb.booking_id = ? AND sb.customer_phone = ?`,
      [bookingId, phone],
    );
    if (rows.length === 0)
      return res
        .status(404)
        .json({
          success: false,
          message:
            "Booking not found. Please check your booking ID and phone number.",
        });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBooking,
  updateBookingStatus,
  trackBooking,
};
