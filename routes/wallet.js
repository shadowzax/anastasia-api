const express = require("express");
const dbModule = require("../mydb/users");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const db = dbModule.db;

const router = express.Router();

router.post("/daily-gift", (req, res) => {
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

    const userId = decoded.userId;

    db.get(
        "SELECT balance, last_daily_gift, wallet_operations FROM users WHERE id = ?",
        [userId],
        (err, user) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            const today = new Date().toISOString().split("T")[0];

            if (user.last_daily_gift === today) {
                return res.status(400).json({
                    success: false,
                    message: "You already claimed today's gift"
                });
            }

            const randomChance = Math.random() * 100;

            let giftAmount = 0;

            if (randomChance <= 90) {
                giftAmount = Math.floor(Math.random() * 20) + 1;
            } else {
                giftAmount = Math.floor(Math.random() * 31) + 20;
            }

            const newBalance = user.balance + giftAmount;

            // تجهيز العمليات السابقة
            let operations = [];
            try {
                operations = user.wallet_operations
                    ? JSON.parse(user.wallet_operations)
                    : [];
            } catch (e) {
                operations = [];
            }

            // إضافة العملية الجديدة
            operations.push({
                type: "daily_gift",
                description: "Daily gift reward",
                amount: giftAmount,
                date: today,
                status: "success"
            });

            db.run(
                "UPDATE users SET balance = ?, last_daily_gift = ?, wallet_operations = ? WHERE id = ?",
                [newBalance, today, JSON.stringify(operations), userId],
                (err) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }

                    res.json({
                        success: true,
                        gift: giftAmount,
                        balance: newBalance,
                        date: today
                    });
                }
            );
        }
    );
});
router.get("/gift-status", (req, res) => {
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

    const userId = decoded.userId;

    db.get(
        "SELECT last_daily_gift FROM users WHERE id = ?",
        [userId],
        (err, user) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            const today = new Date().toISOString().split("T")[0];

            const claimedToday = user.last_daily_gift === today;

            res.json({
                success: true,
                claimedToday
            });
        }
    );
});
router.post("/transfer", (req, res) => {
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

    const senderId = decoded.userId;
    const { receiverId, amount, reason } = req.body;

    if (!receiverId || !amount || amount <= 0 || isNaN(amount)) {
        return res.status(400).json({ error: "Invalid data" });
    }

    db.get(
        "SELECT id, balance, wallet_operations, username FROM users WHERE id = ?",
        [senderId],
        (err, sender) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!sender) return res.status(404).json({ error: "Sender not found" });

            db.get(
                "SELECT id, balance, wallet_operations, username FROM users WHERE id = ?",
                [receiverId],
                (err, receiver) => {
                    if (err) return res.status(500).json({ error: err.message });
                    if (!receiver) return res.status(404).json({ error: "Receiver not found" });

                    if (sender.balance < amount) {
                        return res.status(400).json({ error: "Insufficient balance" });
                    }

                    const senderName = sender.username.split(" ")[0];
                    const receiverName = receiver.username.split(" ")[0];

                    const cleanReason =
                        reason && reason.trim() !== ""
                            ? ` - ${reason.trim()}`
                            : "";

                    let senderOps = [];
                    let receiverOps = [];

                    try {
                        senderOps = sender.wallet_operations
                            ? JSON.parse(sender.wallet_operations)
                            : [];
                    } catch {
                        senderOps = [];
                    }

                    try {
                        receiverOps = receiver.wallet_operations
                            ? JSON.parse(receiver.wallet_operations)
                            : [];
                    } catch {
                        receiverOps = [];
                    }

                    const today = new Date().toISOString().split("T")[0];

                    senderOps.push({
                        type: "transfer",
                        description: `تحويل إلى ${receiverName}${cleanReason}`,
                        amount: -amount,
                        reason: reason || "",
                        date: today,
                        status: "success"
                    });

                    receiverOps.push({
                        type: "transfer",
                        description: `استلام من ${senderName}${cleanReason}`,
                        amount: amount,
                        reason: reason || "",
                        date: today,
                        status: "success"
                    });

                    const newSenderBalance = sender.balance - amount;
                    const newReceiverBalance = receiver.balance + amount;

                    db.run(
                        "UPDATE users SET balance = ?, wallet_operations = ? WHERE id = ?",
                        [newSenderBalance, JSON.stringify(senderOps), senderId],
                        (err) => {
                            if (err) return res.status(500).json({ error: err.message });

                            db.run(
                                "UPDATE users SET balance = ?, wallet_operations = ? WHERE id = ?",
                                [newReceiverBalance, JSON.stringify(receiverOps), receiverId],
                                (err) => {
                                    if (err) return res.status(500).json({ error: err.message });

                                    res.json({
                                        success: true,
                                        message: "Transfer completed",
                                        sentTo: receiverName,
                                        receivedFrom: senderName,
                                        amount,
                                        reason: reason || null,
                                        balance: newSenderBalance
                                    });
                                }
                            );
                        }
                    );
                }
            );
        }
    );
});
module.exports = router;