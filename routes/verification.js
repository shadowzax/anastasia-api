const express = require("express");
const nodemailer = require("nodemailer");
const { db } = require("../mydb/users");

const router = express.Router();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "anastasiapay13@gmail.com",
        pass: "yezo ssxk axnh sxam",
    },
});

function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

router.get("/send", (req, res) => {
    const toEmail = req.query.email;

    if (!toEmail) {
        return res.status(400).json({
            success: false,
            error: "Email is required"
        });
    }

    db.get(
        "SELECT email FROM users WHERE email = ?",
        [toEmail],
        (err, user) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    error: err.message
                });
            }

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: "Email not found"
                });
            }

            const verificationCode = generateVerificationCode();

            db.run(
                "UPDATE users SET verification_code = ? WHERE email = ?",
                [verificationCode, toEmail],
                (err2) => {
                    if (err2) {
                        return res.status(500).json({
                            success: false,
                            error: err2.message
                        });
                    }

                    const mailOptions = {
                        from: '"Anastasia Pay" <anastasiapay13@gmail.com>',
                        to: toEmail,
                        subject: "رمز التحقق الخاص بك",
                        text: `رمز التحقق الخاص بك هو: ${verificationCode}`,
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

            <table width="560" cellpadding="0" cellspacing="0" border="0"
                style="width:100%;max-width:560px;background:#ffffff;border-radius:22px;padding:50px 40px;text-align:center;box-shadow:0 8px 25px rgba(0,0,0,0.05);">

                <tr>
                    <td>

                        <img
                            src="https://files.catbox.moe/h16lww.png"
                            width="250"
                            alt="Logo"
                            style="display:block;margin:0 auto 22px;"
                        >

                        <p style="margin:14px 0 34px;color:#6b7280;font-size:16px;line-height:1.8;">
                            استخدم رمز التحقق التالي لإكمال عملية تسجيل الدخول إلى حسابك بأمان
                        </p>

                        <div style="background:#eff6ff;color:#2563eb;display:inline-block;padding:20px 42px;border-radius:16px;font-size:38px;font-weight:700;letter-spacing:10px;box-shadow:0 4px 14px rgba(37,99,235,0.12);">
                            ${verificationCode}
                        </div>

                        <p style="margin-top:34px;color:#9ca3af;font-size:14px;line-height:1.9;">
                            صلاحية هذا الكود 10 دقائق فقط
                            <br>
                            إذا لم تطلب هذا الكود يمكنك تجاهل الرسالة
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

                    transporter.sendMail(mailOptions, (err3, info) => {
                        if (err3) {
                            return res.status(500).json({
                                success: false,
                                error: err3.message
                            });
                        }

                        return res.json({
                            success: true,
                            messageId: info.messageId,
                            email: toEmail
                        });
                    });
                }
            );
        }
    );
});



const CONFIG = {
    url: "https://panel.anastasia.run",
    appKey: "ptla_Q6pH0ozcsiPE5FjEQtkWmR0cwZYJ1wy7CLrmRzfR3GT"
};

const pteroRequest = async (method, endpoint, body = null) => {
    try {
        const res = await fetch(`${CONFIG.url}/api/${endpoint}`, {
            method,
            headers: {
                Authorization: `Bearer ${CONFIG.appKey}`,
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            body: body ? JSON.stringify(body) : undefined
        });

        return await res.json();
    } catch (err) {
        return { errors: [{ detail: err.message }] };
    }
};

const createOrUpdateUser = async (data) => {
    const search = await pteroRequest("GET", `application/users?filter[email]=${data.email}`);

    if (search.data && search.data.length > 0) {
        const user = search.data[0].attributes;

        await pteroRequest("PATCH", `application/users/${user.id}`, {
            email: data.email,
            username: data.username,
            first_name: data.first_name,
            last_name: data.last_name,
            password: data.password
        });

        return { action: "updated", user };
    }

    const create = await pteroRequest("POST", "application/users", {
        email: data.email,
        username: data.username,
        first_name: data.first_name,
        last_name: data.last_name,
        password: data.password
    });

    if (create.errors) throw new Error(create.errors[0].detail);

    return { action: "created", user: create.attributes };
};
router.post("/verify", (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({
            success: false,
            error: "Email and code are required"
        });
    }

    db.get(
        "SELECT id, email, verification_code, is_verified, plain_password, username FROM users WHERE email = ?",
        [email],
        async (err, user) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    error: err.message
                });
            }

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: "User not found"
                });
            }

            if (Number(user.is_verified) === 1) {
                return res.status(400).json({
                    success: false,
                    error: "Email already verified"
                });
            }

            if (!user.verification_code) {
                return res.status(400).json({
                    success: false,
                    error: "No verification code found"
                });
            }

            if (String(user.verification_code) !== String(code)) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid verification code"
                });
            }

            const nameParts = (user.username || "User").trim().split(" ");

            const first_name = nameParts[0] || "User";
            const last_name =
                nameParts.length > 1
                    ? nameParts[nameParts.length - 1]
                    : "User";

            try {
                await createOrUpdateUser({
                    email: user.email,
                    username: String(user.id),
                    first_name: first_name,
                    last_name: last_name,
                    password: user.plain_password
                });

                db.run(
                    "UPDATE users SET is_verified = 1, verification_code = NULL, plain_password = NULL WHERE email = ?",
                    [email],
                    (err2) => {
                        if (err2) {
                            return res.status(500).json({
                                success: false,
                                error: err2.message
                            });
                        }

                        return res.json({
                            success: true,
                            message: "Email verified and panel account created successfully"
                        });
                    }
                );
            } catch (e) {
                return res.status(500).json({
                    success: false,
                    error: e.message
                });
            }
        }
    );
});

router.get("/verify", async (req, res) => {
    try {
        const email = String(req.query.email || "").trim();
        const code = String(req.query.code || "").trim();

        if (!email || !code) {
            return res.status(400).json({
                success: false,
                error: "Email and code are required"
            });
        }

        db.get(
            "SELECT id, email, verification_code, is_verified, plain_password, username FROM users WHERE email = ?",
            [email],
            async (err, user) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        error: err.message
                    });
                }

                if (!user) {
                    return res.status(404).json({
                        success: false,
                        error: "User not found"
                    });
                }

                if (Number(user.is_verified) === 1) {
                    return res.status(400).json({
                        success: false,
                        error: "Email already verified"
                    });
                }

                if (!user.verification_code) {
                    return res.status(400).json({
                        success: false,
                        error: "No verification code found"
                    });
                }

                if (String(user.verification_code).trim() !== code) {
                    return res.status(400).json({
                        success: false,
                        error: "Invalid verification code"
                    });
                }

                const nameParts = String(user.username || "User").trim().split(" ");

                const first_name = nameParts[0] || "User";

                const last_name =
                    nameParts.length > 1
                        ? nameParts[nameParts.length - 1]
                        : "User";

                try {
                    await createOrUpdateUser({
                        email: user.email,
                        username: String(user.id),
                        first_name,
                        last_name,
                        password: user.plain_password
                    });

                    db.run(
                        "UPDATE users SET is_verified = 1, verification_code = NULL, plain_password = NULL WHERE email = ?",
                        [email],
                        (err2) => {
                            if (err2) {
                                return res.status(500).json({
                                    success: false,
                                    error: err2.message
                                });
                            }

                            return res.status(200).json({
                                success: true,
                                message: "Email verified and panel account created successfully"
                            });
                        }
                    );
                } catch (e) {
                    return res.status(500).json({
                        success: false,
                        error: e.message
                    });
                }
            }
        );
    } catch (e) {
        return res.status(500).json({
            success: false,
            error: e.message
        });
    }
});
module.exports = router;
