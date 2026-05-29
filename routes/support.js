const express = require("express");
const dbModule = require("../mydb/users");
const jwt = require("jsonwebtoken");

const db = dbModule.db;
const router = express.Router();

router.post("/create-ticket", (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            error: "No token provided"
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            error: "Invalid token format"
        });
    }

    let decoded;

    try {
        decoded = jwt.verify(token, "secretkey");
    } catch (err) {
        return res.status(401).json({
            error: "Invalid or expired token"
        });
    }

    const userId = decoded.userId;

    const {
        title,
        category,
        message
    } = req.body;

    if (!title || !category || !message) {
        return res.status(400).json({
            error: "All fields are required"
        });
    }

    db.get(
        "SELECT support_tickets FROM users WHERE id = ?",
        [userId],
        (err, user) => {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            if (!user) {
                return res.status(404).json({
                    error: "User not found"
                });
            }

            let tickets = [];

            try {
                tickets = user.support_tickets
                    ? JSON.parse(user.support_tickets)
                    : [];
            } catch {
                tickets = [];
            }

            const now = new Date();

            const createdAt = now.toISOString().split("T")[0];

            const ticketId = Date.now();

            const newTicket = {
                id: ticketId,
                title,
                category,
                message,
                status: "open",
                createdAt,
                replies: []
            };

            tickets.unshift(newTicket);

            db.run(
                "UPDATE users SET support_tickets = ? WHERE id = ?",
                [JSON.stringify(tickets), userId],
                (err) => {
                    if (err) {
                        return res.status(500).json({
                            error: err.message
                        });
                    }

                    res.json({
                        success: true,
                        message: "Ticket created successfully",
                        ticket: newTicket
                    });
                }
            );
        }
    );
});

router.get("/tickets", (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            error: "No token provided"
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            error: "Invalid token format"
        });
    }

    let decoded;

    try {
        decoded = jwt.verify(token, "secretkey");
    } catch (err) {
        return res.status(401).json({
            error: "Invalid or expired token"
        });
    }

    const userId = decoded.userId;

    db.get(
        "SELECT support_tickets FROM users WHERE id = ?",
        [userId],
        (err, user) => {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            if (!user) {
                return res.status(404).json({
                    error: "User not found"
                });
            }

            let tickets = [];

            try {
                tickets = user.support_tickets
                    ? JSON.parse(user.support_tickets)
                    : [];
            } catch {
                tickets = [];
            }

            res.json({
                success: true,
                tickets
            });
        }
    );
});
router.get("/all-tickets", (req, res) => {
    db.all("SELECT id, username, email, support_tickets FROM users", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        let allTickets = [];

        for (const row of rows) {
            let tickets = [];

            try {
                tickets = row.support_tickets ? JSON.parse(row.support_tickets) : [];
            } catch {
                tickets = [];
            }

            tickets.forEach(ticket => {
                allTickets.push({
                    userId: row.id,
                    username: row.username,
                    userEmail: row.email,
                    ...ticket
                });
            });
        }

        res.json({
            success: true,
            tickets: allTickets
        });
    });
});
router.post("/reply-ticket", (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            error: "No token provided"
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            error: "Invalid token format"
        });
    }

    let decoded;

    try {
        decoded = jwt.verify(token, "secretkey");
    } catch (err) {
        return res.status(401).json({
            error: "Invalid or expired token"
        });
    }

    const userId = decoded.userId;

    const {
        ticketId,
        message
    } = req.body;

    if (!ticketId || !message) {
        return res.status(400).json({
            error: "ticketId and message are required"
        });
    }

    db.get(
        "SELECT support_tickets FROM users WHERE id = ?",
        [userId],
        (err, user) => {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            if (!user) {
                return res.status(404).json({
                    error: "User not found"
                });
            }

            let tickets = [];

            try {
                tickets = user.support_tickets
                    ? JSON.parse(user.support_tickets)
                    : [];
            } catch {
                tickets = [];
            }

            const ticketIndex = tickets.findIndex(
                (t) => t.id == ticketId
            );

            if (ticketIndex === -1) {
                return res.status(404).json({
                    error: "Ticket not found"
                });
            }

            const now = new Date();

            const reply = {
                id: Date.now(),
                message,
                isAdmin: false,
                time: now.toISOString().replace("T", " ").slice(0, 16)
            };

            tickets[ticketIndex].replies.push(reply);

            db.run(
                "UPDATE users SET support_tickets = ? WHERE id = ?",
                [JSON.stringify(tickets), userId],
                (err) => {
                    if (err) {
                        return res.status(500).json({
                            error: err.message
                        });
                    }

                    res.json({
                        success: true,
                        message: "Reply added successfully",
                        reply
                    });
                }
            );
        }
    );
});
router.post("/admin-reply-ticket", (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Invalid token format" });
    }

    let decoded;

    try {
        decoded = jwt.verify(token, "secretkey");
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
/*
    if (!decoded || decoded.role !== "admin") {
        return res.status(403).json({ error: "Access denied" });
    }
*/
    const { ticketId, message } = req.body;

    if (!ticketId || !message) {
        return res.status(400).json({ error: "ticketId and message are required" });
    }

    db.all("SELECT id, support_tickets FROM users", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        let foundUser = null;
        let tickets = null;
        let ticketIndex = -1;

        for (const row of rows) {
            let userTickets = [];

            try {
                userTickets = row.support_tickets ? JSON.parse(row.support_tickets) : [];
            } catch {
                userTickets = [];
            }

            const index = userTickets.findIndex(t => t.id == ticketId);

            if (index !== -1) {
                foundUser = row;
                tickets = userTickets;
                ticketIndex = index;
                break;
            }
        }

        if (!foundUser) {
            return res.status(404).json({ error: "Ticket not found" });
        }

        const now = new Date();

        const reply = {
            id: Date.now(),
            message,
            isAdmin: true,
            time: now.toISOString().replace("T", " ").slice(0, 16)
        };

        tickets[ticketIndex].replies.push(reply);

        db.run(
            "UPDATE users SET support_tickets = ? WHERE id = ?",
            [JSON.stringify(tickets), foundUser.id],
            (err) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                res.json({
                    success: true,
                    message: "Admin reply added successfully",
                    reply
                });
            }
        );
    });
});
router.post("/close-ticket", (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            error: "No token provided"
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            error: "Invalid token format"
        });
    }

    let decoded;

    try {
        decoded = jwt.verify(token, "secretkey");
    } catch (err) {
        return res.status(401).json({
            error: "Invalid or expired token"
        });
    }

    const userId = decoded.userId;

    const {
        ticketId
    } = req.body;

    if (!ticketId) {
        return res.status(400).json({
            error: "ticketId is required"
        });
    }

    db.get(
        "SELECT support_tickets FROM users WHERE id = ?",
        [userId],
        (err, user) => {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            if (!user) {
                return res.status(404).json({
                    error: "User not found"
                });
            }

            let tickets = [];

            try {
                tickets = user.support_tickets
                    ? JSON.parse(user.support_tickets)
                    : [];
            } catch {
                tickets = [];
            }

            const ticketIndex = tickets.findIndex(
                (t) => t.id == ticketId
            );

            if (ticketIndex === -1) {
                return res.status(404).json({
                    error: "Ticket not found"
                });
            }

            tickets[ticketIndex].status = "closed";

            db.run(
                "UPDATE users SET support_tickets = ? WHERE id = ?",
                [JSON.stringify(tickets), userId],
                (err) => {
                    if (err) {
                        return res.status(500).json({
                            error: err.message
                        });
                    }

                    res.json({
                        success: true,
                        message: "Ticket closed successfully"
                    });
                }
            );
        }
    );
});

module.exports = router;