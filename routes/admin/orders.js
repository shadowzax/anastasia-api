const express = require("express");
const router = express.Router();

const dbModule = require("../../mydb/users");
const db = dbModule.db;

router.get("/show", (req, res) => {
    db.all("SELECT * FROM users", [], (err, rows) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        const orders = [];

        rows.forEach(user => {
            let userOrders = [];

            try {
                userOrders = typeof user.orders === "string"
                    ? JSON.parse(user.orders || "[]")
                    : (user.orders || []);
            } catch {
                userOrders = [];
            }

            if (!Array.isArray(userOrders)) {
                userOrders = [];
            }

            userOrders.forEach(order => {
                orders.push({
                    owner_id: user.id || null,
                    owner_username: user.username || null,
                    owner_email: user.email || null,

                    order_id: order.id || null,
                    order_type: order.order_type || order.type || null,
                    description: order.description || null,
                    amount: order.amount || null,
                    country: order.country || null,
                    payment_method: order.payment_method || null,
                    currency: order.currency || null,
                    currency_id: order.currency_id || null,
                    notes: order.notes || null,
                    receipt_image: order.receipt_image || null,
                    status: order.status || null,
                    status_code: order.status_code || null,
                    date: order.date || null,
                    created_at: order.created_at || null,

                    raw_data: order
                });
            });
        });

        return res.json({
            success: true,
            total_orders: orders.length,
            orders: orders
        });
    });
});
router.post("/approve-order", (req, res) => {
    const { userId, email, orderId } = req.body;

    if ((!userId && !email) || !orderId) {
        return res.status(400).json({
            success: false,
            message: "userId or email + orderId are required"
        });
    }

    const query = userId
        ? "SELECT * FROM users WHERE id = ?"
        : "SELECT * FROM users WHERE email = ?";

    const param = userId || email;

    db.get(query, [param], (err, user) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        let orders = [];
        let wallet_operations = [];
        let notifications = [];

        try {
            orders = JSON.parse(user.orders || "[]");
        } catch {
            orders = [];
        }

        try {
            wallet_operations = JSON.parse(user.wallet_operations || "[]");
        } catch {
            wallet_operations = [];
        }

        try {
            notifications = JSON.parse(user.notifications || "[]");
        } catch {
            notifications = [];
        }

        const orderIndex = orders.findIndex(o => o.id == orderId);

        if (orderIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        const order = orders[orderIndex];

        if (order.status_code === "approved") {
            return res.json({
                success: true,
                message: "Order already completed",
                order
            });
        }

        if (order.status_code !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Order already processed"
            });
        }

        const alphaRates = {
            EGP: 1,
            SDG: 13,
            USD: 0.02,
            SAR: 0.08,
            QAR: 0.072,
            OMR: 0.0076,
            JOD: 0.0143,
            BHD: 0.0076,
            IQD: 26,
            TND: 0.060,
            MAD: 0.2
        };

        const amount = Number(order.amount || 0);
        const currency = String(order.currency || "EGP").toUpperCase();

        const rate = alphaRates[currency];

        if (!rate) {
            return res.status(400).json({
                success: false,
                message: "Unsupported currency"
            });
        }

        const alphaAmount = amount / rate;

        const beforeBalance = Number(user.balance || 0);
        const afterBalance = beforeBalance + alphaAmount;

        orders[orderIndex] = {
            ...order,
            status: "مكتمل",
            status_code: "approved",
            processed_at: new Date().toISOString(),
            alpha_added: alphaAmount
        };

        wallet_operations.push({
            type: "charge_request_approved",
            order_id: order.id,
            currency: currency,
            paid_amount: amount,
            alpha_added: alphaAmount,
            before_balance: beforeBalance,
            after_balance: afterBalance,
            created_at: new Date().toISOString()
        });

        notifications.push({
            id: Date.now(),
            text: `تم إضافة ${alphaAmount.toFixed(2)} ألفا إلى رصيدك`,
            read: false,
            time: new Date().toISOString()
        });

        db.run(
            `UPDATE users 
             SET balance = ?, orders = ?, wallet_operations = ?, notifications = ? 
             WHERE id = ?`,
            [
                afterBalance,
                JSON.stringify(orders),
                JSON.stringify(wallet_operations),
                JSON.stringify(notifications),
                user.id
            ],
            (updateErr) => {
                if (updateErr) {
                    return res.status(500).json({
                        success: false,
                        message: updateErr.message
                    });
                }

                return res.json({
                    success: true,
                    message: "Order completed successfully",
                    order: orders[orderIndex],
                    balance: afterBalance,
                    alpha_added: alphaAmount
                });
            }
        );
    });
});
router.post("/reject-order", (req, res) => {
    const { userId, email, orderId, reason } = req.body;

    if ((!userId && !email) || !orderId) {
        return res.status(400).json({
            success: false,
            message: "userId or email + orderId are required"
        });
    }

    const query = userId
        ? "SELECT * FROM users WHERE id = ?"
        : "SELECT * FROM users WHERE email = ?";

    const param = userId || email;

    db.get(query, [param], (err, user) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        let orders = [];
        let wallet_operations = [];
        let notifications = [];

        try {
            orders = JSON.parse(user.orders || "[]");
        } catch {
            orders = [];
        }

        try {
            wallet_operations = JSON.parse(user.wallet_operations || "[]");
        } catch {
            wallet_operations = [];
        }

        try {
            notifications = JSON.parse(user.notifications || "[]");
        } catch {
            notifications = [];
        }

        const orderIndex = orders.findIndex(o => o.id == orderId);

        if (orderIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        const order = orders[orderIndex];

        if (order.status_code === "rejected") {
            return res.json({
                success: true,
                message: "Order already rejected",
                order
            });
        }

        if (order.status_code !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Order already processed"
            });
        }

        orders[orderIndex] = {
            ...order,
            status: "مرفوض",
            status_code: "rejected",
            rejection_reason: reason || "لم يتم تحديد سبب",
            processed_at: new Date().toISOString()
        };

        wallet_operations.push({
            type: "charge_request_rejected",
            order_id: order.id,
            amount: Number(order.amount || 0),
            reason: reason || "لم يتم تحديد سبب",
            created_at: new Date().toISOString()
        });

        notifications.push({
            id: Date.now(),
            text: `تم رفض طلب الشحن بسبب: ${reason || "لم يتم تحديد سبب"}`,
            read: false,
            time: new Date().toISOString()
        });

        db.run(
            `UPDATE users SET orders = ?, wallet_operations = ?, notifications = ? WHERE id = ?`,
            [
                JSON.stringify(orders),
                JSON.stringify(wallet_operations),
                JSON.stringify(notifications),
                user.id
            ],
            (updateErr) => {
                if (updateErr) {
                    return res.status(500).json({
                        success: false,
                        message: updateErr.message
                    });
                }

                return res.json({
                    success: true,
                    message: "Order rejected successfully",
                    order: orders[orderIndex]
                });
            }
        );
    });
});
module.exports = router;