const express = require("express");
const dbModule = require("../mydb/users");
const jwt = require("jsonwebtoken");

const db = dbModule.db;
const router = express.Router();

router.get("/render", (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Invalid token format" });
    }

    try {
        const decoded = jwt.verify(token, "secretkey");

        db.get(
            "SELECT notifications FROM users WHERE id = ?",
            [decoded.userId],
            (err, row) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                if (!row) {
                    return res.status(404).json({ error: "User not found" });
                }

                let notifications = [];

                try {
                    notifications = JSON.parse(row.notifications || "[]");
                } catch (e) {
                    notifications = [];
                }

                // ✅ أهم تعديل هنا: ترتيب الأحدث أولاً
                notifications.sort((a, b) => {
                    return new Date(b.time) - new Date(a.time);
                });

                return res.json({
                    success: true,
                    notifications
                });
            }
        );

    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
});
router.post("/read", (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Invalid token format" });
    }

    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ error: "Notification id is required" });
    }

    try {
        const decoded = jwt.verify(token, "secretkey");

        db.get(
            "SELECT notifications FROM users WHERE id = ?",
            [decoded.userId],
            (err, row) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                if (!row) {
                    return res.status(404).json({ error: "User not found" });
                }

                let notifications = [];

                try {
                    notifications = JSON.parse(row.notifications || "[]");
                } catch (e) {
                    notifications = [];
                }

                const index = notifications.findIndex(
                    notif => String(notif.id) === String(id)
                );

                if (index === -1) {
                    return res.status(404).json({ error: "Notification not found" });
                }

                notifications[index].read = true;

                db.run(
                    "UPDATE users SET notifications = ? WHERE id = ?",
                    [JSON.stringify(notifications), decoded.userId],
                    (updateErr) => {
                        if (updateErr) {
                            return res.status(500).json({ error: updateErr.message });
                        }

                        return res.json({
                            success: true,
                            message: "Notification marked as read"
                        });
                    }
                );
            }
        );

    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
});
router.post("/readall", (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Invalid token format" });
    }

    try {
        const decoded = jwt.verify(token, "secretkey");

        db.get(
            "SELECT notifications FROM users WHERE id = ?",
            [decoded.userId],
            (err, row) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                if (!row) {
                    return res.status(404).json({ error: "User not found" });
                }

                let notifications = [];

                try {
                    notifications = JSON.parse(row.notifications || "[]");
                } catch (e) {
                    notifications = [];
                }

                notifications = notifications.map(notif => ({
                    ...notif,
                    read: true
                }));

                db.run(
                    "UPDATE users SET notifications = ? WHERE id = ?",
                    [JSON.stringify(notifications), decoded.userId],
                    (updateErr) => {
                        if (updateErr) {
                            return res.status(500).json({ error: updateErr.message });
                        }

                        return res.json({
                            success: true,
                            message: "All notifications marked as read"
                        });
                    }
                );
            }
        );

    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
});
module.exports = router;