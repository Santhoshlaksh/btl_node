const db = require('../config/db');

exports.makelist = (req, res) => {
    const query = 'SELECT DISTINCT make FROM make_model_master';

    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Database error" });
        }

        return res.status(200).json({
            message: "brand list",
            brand: results
        });
    });
};
