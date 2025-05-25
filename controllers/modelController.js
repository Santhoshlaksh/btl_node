const db = require('../config/db');

exports.modellist = (req, res) => {
    const { make } = req.body;

    if (!make) {
        return res.status(400).json({ message: "Brand is not selected" });
    }

    const query = 'SELECT model FROM make_model_master WHERE make = ?';

    db.query(query, [make], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Database error" });
        }

        if (results.length > 0) {
            return res.status(200).json({
                message: "Models fetched successfully",
                models: results
            });
        } else {
            return res.status(404).json({ message: "No models found for this make" });
        }
    });
};
