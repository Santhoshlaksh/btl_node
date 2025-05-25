const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for file upload
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
exports.uploadImages = upload.any(); // Accept any fields like img1, img2...

exports.checkin = (req, res) => {
  const {
    user_id,
    plan_id,
    lat,
    lon,
    mobile_time,
    mobile_battery,
    device_details,
    city
  } = req.body;

  if (!user_id) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const getLastIdQuery = `SELECT checkin_id FROM btl_check_in ORDER BY id DESC LIMIT 1`;

  db.query(getLastIdQuery, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error while fetching last checkin_id" });
    }

    let newCheckinId = 'IN00001';

    if (results.length > 0 && results[0].checkin_id) {
      const lastId = results[0].checkin_id;
      const numberPart = parseInt(lastId.replace('IN', ''), 10);
      const nextNumber = numberPart + 1;
      newCheckinId = 'IN' + nextNumber.toString().padStart(5, '0');
    }

    const insertCheckinQuery = `
      INSERT INTO btl_check_in 
      (user_id, plan_id, checkin_id, lat, lon, mobile_time, mobile_battery, device_details, city, created_by, created_date, is_active, check_out_flag)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const checkinValues = [
      user_id,
      plan_id,
      newCheckinId,
      lat,
      lon,
      mobile_time,
      mobile_battery,
      device_details,
      city,
      user_id,
      new Date(),
      1,
      0
    ];

    db.query(insertCheckinQuery, checkinValues, (err2, result) => {
      if (err2) {
        console.error(err2);
        return res.status(500).json({ message: "Database error while inserting check-in" });
      }
      


      // Handle image uploads and build image JSON
      const imageUrls = {};
      if (req.files && req.files.length > 0) {
        req.files.forEach((file, index) => {
          if (index < 4) {
            imageUrls[`img${index + 1}`] = file.path;
          }
        });
      }

      const insertAgentQuery = `
        INSERT INTO btl_agent_details 
        (checkin_id, user_id, lat, lon, mobile_time, mobile_battery, device_details, city, image, check_in_type, created_by, created_date) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const agentValues = [
        newCheckinId,
        user_id,
        lat,
        lon,
        mobile_time,
        mobile_battery,
        device_details,
        city,
        JSON.stringify(imageUrls),
        1,
        user_id,
        new Date()
      ];

      db.query(insertAgentQuery, agentValues, (err3) => {
        if (err3) {
          console.error(err3);
          return res.status(500).json({ message: "Error inserting agent details" });
        }

        return res.status(200).json({
          message: "Check-in and agent record inserted successfully",
          checkin_id: newCheckinId,
          images: imageUrls
        });
      });
    });
  });
};
