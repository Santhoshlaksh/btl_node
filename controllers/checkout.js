const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer storage config for images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueName + path.extname(file.originalname));
  }
});
const upload = multer({ storage });
exports.uploadImages = upload.array('images', 4); // Accept max 4 images

exports.checkout = (req, res) => {
  const {
    checkin_id,
    user_id,
    lat,
    lon,
    mobile_time,
    mobile_battery,
    device_details,
    city
  } = req.body;

  if (!checkin_id || !user_id) {
    return res.status(400).json({ message: "Missing required fields: checkin_id or user_id" });
  }

  // Prepare image JSON
  const imageUrls = {};
  if (req.files && req.files.length > 0) {
    req.files.forEach((file, index) => {
      if (index < 4) {
        imageUrls[`img${index + 1}`] = file.path;
      }
    });
  }

  // 1. Update checkout_flag and checkout_time in btl_check_in
  const updateCheckoutQuery = `
    UPDATE btl_check_in 
    SET check_out_flag = 1, checkout_time = ? 
    WHERE checkin_id = ?
  `;

  const checkoutTime = mobile_time || new Date();

  db.query(updateCheckoutQuery, [checkoutTime, checkin_id], (updateErr) => {
    if (updateErr) {
      console.error('Error updating checkout:', updateErr);
      return res.status(500).json({ message: "Database error updating checkout" });
    }

    // 2. Insert into btl_agent_details with check_in_type = 3, including images
    const insertAgentQuery = `
      INSERT INTO btl_agent_details 
      (checkin_id, user_id, lat, lon, mobile_time, mobile_battery, device_details, city, image, check_in_type, created_by, created_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      checkin_id,
      user_id,
      lat,
      lon,
      mobile_time,
      mobile_battery,
      device_details,
      city,
      JSON.stringify(imageUrls),
      3, // checkout type
      user_id,
      new Date()
    ];

    db.query(insertAgentQuery, values, (insertErr) => {
      if (insertErr) {
        console.error('Error inserting checkout details:', insertErr);
        return res.status(500).json({ message: "Database error inserting checkout details" });
      }

      return res.status(200).json({
        message: "Checkout successful",
        checkin_id: checkin_id,
        images: imageUrls
      });
    });
  });
};
