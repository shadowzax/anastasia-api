const express = require("express");
const dbModule = require("../mydb/users");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const db = dbModule.db;

const router = express.Router();

router.get("/profile", (req, res) => {
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
            "SELECT * FROM users WHERE id = ?",
            [decoded.userId],
            (err, user) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                if (!user) {
                    return res.status(404).json({ error: "User not found" });
                }

                delete user.password;

                res.json({
                    success: true,
                    user
                });
            }
        );
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
});


router.get("/check-token", (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            valid: false,
            message: "No token provided"
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            valid: false,
            message: "Invalid token format"
        });
    }

    try {
        const decoded = jwt.verify(token, "secretkey");

        res.status(200).json({
            success: true,
            valid: true,
            message: "Token is valid",
            decoded
        });

    } catch (err) {

        if (err.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                valid: false,
                expired: true,
                message: "Token expired"
            });
        }

        return res.status(401).json({
            success: false,
            valid: false,
            message: "Invalid token"
        });
    }
});
/*------------------------------------------------------*/
const upload = multer({ dest: "uploads/" });
const fs = require("fs");
const API_KEY = "cd3664692e0290e136732602b869ba5e";
const axios = require("axios");
async function uploadImage(filePath, expiration = 0) {
    const image = fs.readFileSync(filePath);
    const base64Image = image.toString("base64");

    const formData = new URLSearchParams();
    formData.append("key", API_KEY);
    formData.append("image", base64Image);

    if (expiration) {
        formData.append("expiration", expiration);
    }

    const response = await axios.post(
        "https://api.imgbb.com/1/upload",
        formData,
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        }
    );

    if (response.data && response.data.success) {
        return response.data.data.url; // أو display_url
    } else {
        throw new Error(
            response.data?.error?.message || "Upload failed"
        );
    }
}

// 🔥 API رفع الصورة
router.post("/image", upload.single("image"), async (req, res) => {
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

        if (!req.file) {
            return res.status(400).json({ error: "No image uploaded" });
        }

        // 🔥 رفع الصورة
        const imageUrl = await uploadImage(req.file.path);

        // 🔥 تحديث DB
        db.run(
            "UPDATE users SET profile_image = ? WHERE id = ?",
            [imageUrl, decoded.userId],
            function (err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                if (this.changes === 0) {
                    return res.status(404).json({ error: "User not found" });
                }

                res.json({
                    success: true,
                    message: "Profile image updated",
                    profile_image: imageUrl
                });
            }
        );

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
router.post("/charge-request", upload.single("image"), async (req, res) => {
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

    try {
        const decoded = jwt.verify(token, "secretkey");

        const {
            country,
            payment_method,
            amount,
            currency,
            currency_id,
            notes
        } = req.body;

        if (
            !country ||
            !payment_method ||
            !amount ||
            !currency ||
            !currency_id
        ) {
            return res.status(400).json({
                error: "country, payment_method, amount, currency and currency_id are required"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                error: "Receipt image is required"
            });
        }

        const imageUrl = await uploadImage(req.file.path);

        db.get(
            "SELECT wallet_operations, orders FROM users WHERE id = ?",
            [decoded.userId],
            (err, row) => {

                if (err) {
                    return res.status(500).json({
                        error: err.message
                    });
                }

                if (!row) {
                    return res.status(404).json({
                        error: "User not found"
                    });
                }

                let walletOperations = [];
                let orders = [];

                try {
                    walletOperations = row.wallet_operations
                        ? JSON.parse(row.wallet_operations)
                        : [];
                } catch {
                    walletOperations = [];
                }

                try {
                    orders = row.orders
                        ? JSON.parse(row.orders)
                        : [];
                } catch {
                    orders = [];
                }

                const createdAt = new Date().toISOString();

                const operationId = Date.now();

                const newOperation = {
                    id: operationId,
                    type: "طلب شحن",
                    description: `طلب شحن عبر ${payment_method}`,
                    amount: amount,
                    country: country,
                    payment_method: payment_method,
                    currency: currency,
                    currency_id: currency_id,
                    notes: notes || "",
                    receipt_image: imageUrl,
                    status: "بانتظار الموافقة",
                    status_code: "pending",
                    date: createdAt,
                    created_at: createdAt
                };

                const newOrder = {
                    id: operationId,
                    order_type: "charge_request",
                    type: "طلب شحن",
                    description: `طلب شحن عبر ${payment_method}`,
                    amount: amount,
                    country: country,
                    payment_method: payment_method,
                    currency: currency,
                    currency_id: currency_id,
                    notes: notes || "",
                    receipt_image: imageUrl,
                    status: "بانتظار الموافقة",
                    status_code: "pending",
                    date: createdAt,
                    created_at: createdAt
                };

                walletOperations.push(newOperation);

                orders.push(newOrder);

                db.run(
                    "UPDATE users SET wallet_operations = ?, orders = ? WHERE id = ?",
                    [
                        JSON.stringify(walletOperations),
                        JSON.stringify(orders),
                        decoded.userId
                    ],
                    function (updateErr) {

                        if (updateErr) {
                            return res.status(500).json({
                                error: updateErr.message
                            });
                        }

                        res.json({
                            success: true,
                            message: "تم إرسال طلب الشحن بنجاح",
                            operation: newOperation,
                            order: newOrder
                        });
                    }
                );
            }
        );

    } catch (err) {

        return res.status(500).json({
            error: err.message
        });
    }
});
module.exports = router;
