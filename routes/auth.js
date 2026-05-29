const express = require("express");
const bcrypt = require("bcrypt");
const dbModule = require("../mydb/users");
const jwt = require("jsonwebtoken");
const db = dbModule.db;
const generateId = dbModule.generateId;

const router = express.Router();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "anastasiapay13@gmail.com",
        pass: "yezo ssxk axnh sxam"
    }
});

function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

const sendVerificationEmail = (toEmail, code) => {
    const mailOptions = {
        from: '"Anastasia Pay" <anastasiapay13@gmail.com>',
        to: toEmail,
        subject: "رمز التحقق الخاص بك",
        text: `رمز التحقق الخاص بك هو: ${code}`,
        html: `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Code</title>
</head>
<body style="margin:0;padding:40px 15px;background:#f4f7fb;font-family:'Segoe UI',Tahoma,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="center">
<table width="560" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px;background:#ffffff;border-radius:22px;padding:50px 40px;text-align:center;box-shadow:0 8px 25px rgba(0,0,0,0.05);">
<tr>
<td>
<img src="https://files.catbox.moe/h16lww.png" width="250" style="display:block;margin:0 auto 22px;">
<p style="color:#6b7280;font-size:16px;">استخدم رمز التحقق</p>
<div style="background:#eff6ff;color:#2563eb;display:inline-block;padding:20px 42px;border-radius:16px;font-size:38px;font-weight:700;letter-spacing:10px;">
${code}
</div>
<p style="margin-top:20px;color:#9ca3af;font-size:14px;">
الكود صالح لمدة 10 دقائق
</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>
`
    };

    return transporter.sendMail(mailOptions);
};

router.post("/register", (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    db.get("SELECT email FROM users WHERE email = ?", [email], async (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (row) {
            return res.status(400).json({ error: "Email already exists" });
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const plainPassword = password;
            const id = generateId();
            const verificationCode = generateVerificationCode();

            db.run(
                "INSERT INTO users (id, username, email, password, plain_password, verification_code, is_verified) VALUES (?, ?, ?, ?, ?, ?, 0)",
                [id, username, email, hashedPassword, plainPassword, verificationCode],
                async function (err2) {
                    if (err2) {
                        return res.status(500).json({ error: err2.message });
                    }

                    try {
                        await sendVerificationEmail(email, verificationCode);

                        return res.json({
                            success: true,
                            userId: id,
                            message: "User created and verification email sent"
                        });
                    } catch (mailErr) {
                        return res.status(500).json({
                            success: false,
                            error: mailErr.message
                        });
                    }
                }
            );
        } catch (err3) {
            return res.status(500).json({ error: err3.message });
        }
    });
});
/*
router.post("/register", (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    db.get("SELECT email FROM users WHERE email = ?", [email], async (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (row) {
            return res.status(400).json({ error: "Email already exists" });
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const plainPassword = password;
            const id = generateId();

            db.run(
                "INSERT INTO users (id, username, email, password, plain_password) VALUES (?, ?, ?, ?, ?)",
                [id, username, email, hashedPassword, plainPassword],
                function (err) {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }

                    res.json({
                        success: true,
                        userId: id
                    });
                }
            );

        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    });
});
*/
/*-----------------------------------------------*/
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!user) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        try {
            const match = await bcrypt.compare(password, user.password);

            if (!match) {
                return res.status(400).json({ error: "Invalid email or password" });
            }

const token = jwt.sign(
    { userId: user.id },
                "secretkey",
    { expiresIn: "1y" }
);

            res.json({
                success: true,
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            });

        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    });
});
module.exports = router;