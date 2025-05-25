const db = require('../config/db');

exports.activitylist = (req, res) => {
    const query = 'SELECT activity FROM btl_main_activity';

    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Database error" });
        }

        return res.status(200).json({
            message: "Activity list",
            List: results
        });
    });
};
