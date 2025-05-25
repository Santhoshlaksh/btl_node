const db = require('../config/db');
exports.login = (req, res) => {
    const { agent_id, password } = req.body;

    if (!agent_id || !password) {
        return res.status(400).json({ message: "Agent ID and Password are required" });
    }

    const query = 'SELECT id FROM btl_user_login WHERE agent_id = ? AND password = ?';

    db.query(query, [agent_id, password], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Database error" });
        }

        if (results.length > 0) {
            return res.status(200).json({
                message: "Login successful",
                id: results[0].id
            });
        } else {
            return res.status(401).json({ message: "Invalid credentials" });
        }
    });
};
