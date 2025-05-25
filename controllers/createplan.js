const db = require('../config/db');

exports.createplan = (req, res) => {
  const {
    user_id,
    from_date,
    to_date,
    activity_id,
    catchment_area_id,
    pincode,
    location,
    planned_leads,
    planned_conversion
  } = req.body;

  if (
    !user_id || !from_date || !to_date || !activity_id || !catchment_area_id ||
    !pincode || !location || !planned_leads || !planned_conversion
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Step 1: Get last plan_unique_id
  const getLastIdQuery = `SELECT plan_unique_id FROM btl_plan ORDER BY id DESC LIMIT 1`;

  db.query(getLastIdQuery, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error while fetching last plan_unique_id" });
    }

    let newPlanUniqueId = 'btl00001'; // default for first entry

    if (results.length > 0) {
      const lastId = results[0].plan_unique_id; // e.g. "btl00042"
      const numberPart = parseInt(lastId.replace('btl', ''), 10); // extract numeric part: 42
      const nextNumber = numberPart + 1;
      newPlanUniqueId = 'btl' + nextNumber.toString().padStart(5, '0'); // pad with zeros, e.g. btl00043
    }

    // Step 2: Insert new plan with generated plan_unique_id
    const insertQuery = `
      INSERT INTO btl_plan 
      (user_id, plan_unique_id, from_date, to_date, activity_id, catchment_area_id, pincode, created_by, created_date, location_id, planned_leads, planned_conversion)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)
    `;

  const values = [
  user_id,         // user_id
  newPlanUniqueId, // plan_unique_id
  from_date,       // from_date
  to_date,         // to_date
  activity_id,     // activity_id
  catchment_area_id, // catchment_area_id
  pincode,         // pincode
  user_id,         // created_by
  new Date(),      // created_date (or a formatted string)
  location,        // location_id
  planned_leads,   // planned_leads
  planned_conversion // planned_conversion
];

    db.query(insertQuery, values, (err2, result) => {
      if (err2) {
        console.error(err2);
        return res.status(500).json({ message: "Database error while inserting plan" });
      }

      return res.status(200).json({
        message: "Plan inserted successfully",
        plan_unique_id: newPlanUniqueId,
        insertId: result.insertId
      });
    });
  });
};
