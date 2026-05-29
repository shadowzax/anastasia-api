const express = require("express");
const router = express.Router();

const dbModule = require("../../mydb/users");
const db = dbModule.db;

router.get("/show", (req, res) => {
    db.all("SELECT * FROM users", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const parsedUsers = rows.map(user => ({
            ...user,
            orders: JSON.parse(user.orders || "[]"),
            items: JSON.parse(user.items || "[]"),
            notifications: JSON.parse(user.notifications || "[]"),
            public_chat: JSON.parse(user.public_chat || "[]"),
            private_chat: JSON.parse(user.private_chat || "[]"),
            auctions: JSON.parse(user.auctions || "[]"),
            sales: JSON.parse(user.sales || "[]"),
            purchases: JSON.parse(user.purchases || "[]"),
            servers_history: JSON.parse(user.servers_history || "[]"),
            support_tickets: JSON.parse(user.support_tickets || "[]"),
            free_servers: JSON.parse(user.free_servers || "[]"),
            wallet_operations: JSON.parse(user.wallet_operations || "[]")
        }));

        res.json({
            success: true,
            users: parsedUsers
        });
    });
});
router.post("/add-balance", (req, res) => {
    const { userId, email, amount } = req.body;

    if ((!userId && !email) || !amount) {
        return res.status(400).json({
            success: false,
            message: "يجب إرسال الايدي أو الايميل مع المبلغ"
        });
    }

    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({
            success: false,
            message: "المبلغ غير صالح"
        });
    }

    let query = "";
    let params = [];

    if (userId) {
        query = "SELECT * FROM users WHERE id = ?";
        params = [userId];
    } else {
        query = "SELECT * FROM users WHERE email = ?";
        params = [email];
    }

    db.get(query, params, (err, user) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "المستخدم غير موجود"
            });
        }

        const currentBalance = parseFloat(user.balance || 0);

        const newBalance = currentBalance + parsedAmount;

        let walletOperations = [];

        try {
            walletOperations = JSON.parse(
                user.wallet_operations || "[]"
            );
        } catch {
            walletOperations = [];
        }

        walletOperations.unshift({
            type: "admin_add_balance",
            amount: parsedAmount,
            before_balance: currentBalance,
            after_balance: newBalance,
            created_at: new Date().toISOString()
        });

        db.run(
            `
            UPDATE users
            SET
                balance = ?,
                wallet_operations = ?
            WHERE id = ?
            `,
            [
                newBalance,
                JSON.stringify(walletOperations),
                user.id
            ],
            function (updateErr) {

                if (updateErr) {
                    return res.status(500).json({
                        success: false,
                        message: updateErr.message
                    });
                }

                return res.json({
                    success: true,
                    message: "تم إضافة الرصيد بنجاح",
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        old_balance: currentBalance,
                        new_balance: newBalance
                    }
                });
            }
        );
    });
});
router.post("/delete-user", (req, res) => {
    const { userId, email } = req.body;

    if (!userId && !email) {
        return res.status(400).json({
            success: false,
            message: "يجب إرسال الايدي أو الايميل"
        });
    }

    let query = "";
    let params = [];

    if (userId) {
        query = "SELECT * FROM users WHERE id = ?";
        params = [userId];
    } else {
        query = "SELECT * FROM users WHERE email = ?";
        params = [email];
    }

    db.get(query, params, (err, user) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "المستخدم غير موجود"
            });
        }

        db.run(
            "DELETE FROM users WHERE id = ?",
            [user.id],
            function (deleteErr) {

                if (deleteErr) {
                    return res.status(500).json({
                        success: false,
                        message: deleteErr.message
                    });
                }

                return res.json({
                    success: true,
                    message: "تم حذف الحساب بنجاح",
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email
                    }
                });
            }
        );
    });
});
module.exports = router;