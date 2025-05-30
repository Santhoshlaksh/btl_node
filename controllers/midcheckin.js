const db = require('../config/db');

exports.midcheckin = (req, res) => {
  const {
    checkin_id,
    checkin_type,
    user_id,
    lat,
    lon,
    mobile_time,
    mobile_battery,
    device_details,
    city
  } = req.body;

  if (!checkin_id || !user_id) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (checkin_type !== '2') {
    return res.status(400).json({ message: "Please provide the correct checkin_type: '2'" });
  }

  const imageUrls = {};
  if (req.files && req.files.length > 0) {
    req.files.forEach((file, index) => {
      if (index < 4) {
        imageUrls[`img${index + 1}`] = file.path;
      }
    });
  }

  // console.log("Files uploaded:", req.files);

  const insertAgentQuery = 
    `INSERT INTO btl_agent_details 
    (checkin_id, user_id, lat, lon, mobile_time, mobile_battery, device_details, city, image, check_in_type, created_by, created_date) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

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
    checkin_type,
    user_id,
    new Date()
  ];

  db.query(insertAgentQuery, values, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error inserting mid-checkin" });
    }

    return res.status(200).json({
      message: "Mid-checkin inserted successfully",
      checkin_id: checkin_id,
      images: imageUrls
    });
  });
};
