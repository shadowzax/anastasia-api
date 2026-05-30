const express = require("express");
const dbModule = require("../mydb/users");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const db = dbModule.db;
const router = express.Router();

const platforms = [
    {
        name: "exe1",
        base: "https://exe.io/st?api=4c625be6b11d02ade39a10a943f08bf1ab8f4167&url="
    },
    {
        name: "exe2",
        base: "https://exe.io/st?api=59298b758103705b7322c724cf709cdc7a96479d&url="
    },
    {
        name: "uii",
        base: "https://uii.io/st?api=9596b5b6794a02c75aac16e23567570498d3ae37&url="
    },
    {
        name: "shrinkme",
        base: "https://shrinkme.io/st?api=548b4e82a510e52828e24efec9aef87f4d109fed&url="
    }
];

function generateToken(len = 12) {
    return crypto.randomBytes(len)
        .toString("base64")
        .replace(/[^a-zA-Z0-9]/g, "")
        .slice(0, len);
}

function getToday(history) {
    const today = new Date().toDateString();
    return history.filter(h => new Date(h.created_at).toDateString() === today);
}

function getLastPlatform(history) {
    if (!history.length) return null;
    return history[history.length - 1].platform;
}

function pickPlatform(lastPlatform) {
    let available = platforms.filter(p => p.name !== lastPlatform);
    if (available.length === 0) available = platforms;
    return available[Math.floor(Math.random() * available.length)];
}
router.post("/create", (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, "secretkey");

        db.get(
            "SELECT * FROM users WHERE id = ?",
            [decoded.userId],
            (err, user) => {
                if (err) return res.status(500).json({ error: err.message });
                if (!user) return res.status(404).json({ error: "User not found" });

                let history = [];
                try {
                    history = user.ads_history ? JSON.parse(user.ads_history) : [];
                } catch {
                    history = [];
                }

                const today = new Date().toISOString().split("T")[0];

                let adsTodayUsed = user.ads_today_used || 0;
                const adsLimit = user.ads_limit_today || 8;

                const lastActivateDate = user.last_ad_activate
                    ? new Date(user.last_ad_activate).toISOString().split("T")[0]
                    : null;

                if (lastActivateDate !== today) {
                    adsTodayUsed = 0;
                }

                if (adsTodayUsed >= adsLimit) {
                    db.run(
                        "UPDATE users SET ads_today_used = ?, last_ad_activate = ? WHERE id = ?",
                        [adsTodayUsed, user.last_ad_activate, decoded.userId],
                        () => {
                            delete user.password;
                            user.ads_history = history;
                            user.ads_today_used = adsTodayUsed;

                            return res.json({
                                success: true,
                                message: "Daily limit reached",
                                user
                            });
                        }
                    );
                    return;
                }

                const lastPlatform = getLastPlatform(history);
                const platform = pickPlatform(lastPlatform);

                const tokenGen = generateToken(12);

                const domain = "https://anastasiavip.com/go/";

                const finalLink = platform.base + domain + tokenGen;

                const newAd = {
                    token: tokenGen,
                    platform: platform.name,
                    link: finalLink,
                    active: true,
                    adsbalance: 1,
                    created_at: new Date().toISOString()
                };

                history.push(newAd);
                adsTodayUsed += 0;

                db.run(
                    "UPDATE users SET ads_history = ?, ads_today_used = ?, last_ad_activate = ? WHERE id = ?",
                    [
                        JSON.stringify(history),
                        adsTodayUsed,
                        new Date().toISOString(),
                        decoded.userId
                    ],
                    function (err2) {
                        if (err2) return res.status(500).json({ error: err2.message });

                        delete user.password;
                        user.ads_history = history;
                        user.ads_today_used = adsTodayUsed;
                        user.last_ad_activate = new Date().toISOString();

                        return res.json({
                            success: true,
                            user,
                            new_ad: newAd
                        });
                    }
                );
            }
        );
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
});
/*
router.post("/create", (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, "secretkey");

        db.get(
            "SELECT * FROM users WHERE id = ?",
            [decoded.userId],
            (err, user) => {
                if (err) return res.status(500).json({ error: err.message });
                if (!user) return res.status(404).json({ error: "User not found" });

                let history = [];
                try {
                    history = user.ads_history ? JSON.parse(user.ads_history) : [];
                } catch {
                    history = [];
                }

                const today = new Date().toDateString();

                const lastActivate = user.last_ad_activate
                    ? new Date(user.last_ad_activate).toDateString()
                    : null;

                let adsTodayUsed = user.ads_today_used || 0;
                const adsLimit = user.ads_limit_today || 4;

                if (lastActivate !== today) {
                    adsTodayUsed = 0;
                }

                const todayHistory = history.filter(
                    ad => new Date(ad.created_at).toDateString() === today
                );

                const lastPlatform = getLastPlatform(history);
                const platform = pickPlatform(lastPlatform);

                const platformUsedToday = todayHistory.some(
                    ad => ad.platform === platform.name
                );

                if (platformUsedToday) {
                    return res.json({
                        success: false,
                        message: "Platform already used today"
                    });
                }

                if (adsTodayUsed >= adsLimit || todayHistory.length >= adsLimit) {
                    db.run(
                        "UPDATE users SET ads_today_used = ?, last_ad_activate = ? WHERE id = ?",
                        [adsTodayUsed, new Date().toISOString(), decoded.userId]
                    );

                    delete user.password;

                    return res.json({
                        success: true,
                        message: "Daily limit reached",
                        user
                    });
                }

                const tokenGen = generateToken(12);
                const domain = "http://localhost:3000/go/";
                const finalLink = platform.base + domain + tokenGen;

                const newAd = {
                    token: tokenGen,
                    platform: platform.name,
                    link: finalLink,
                    active: true,
                    adsbalance: 1,
                    created_at: new Date().toISOString()
                };

                history.push(newAd);

                const newTodayUsed = adsTodayUsed + 1;
                const now = new Date().toISOString();

                db.run(
                    "UPDATE users SET ads_history = ?, ads_today_used = ?, last_ad_activate = ? WHERE id = ?",
                    [
                        JSON.stringify(history),
                        newTodayUsed,
                        now,
                        decoded.userId
                    ],
                    function (err2) {
                        if (err2) return res.status(500).json({ error: err2.message });

                        delete user.password;

                        user.ads_history = history;
                        user.ads_today_used = newTodayUsed;
                        user.last_ad_activate = now;

                        return res.json({
                            success: true,
                            user,
                            new_ad: newAd
                        });
                    }
                );
            }
        );
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
});
*/
/*
router.post("/create", (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, "secretkey");

        db.get(
            "SELECT * FROM users WHERE id = ?",
            [decoded.userId],
            (err, user) => {
                if (err) return res.status(500).json({ error: err.message });
                if (!user) return res.status(404).json({ error: "User not found" });

                let history = [];
                try {
                    history = user.ads_history ? JSON.parse(user.ads_history) : [];
                } catch {
                    history = [];
                }

                const todayHistory = getToday(history);
                if (todayHistory.length >= 4) {
                    delete user.password;
                    return res.json({
                        success: true,
                        message: "Daily limit reached",
                        user
                    });
                }

                const lastPlatform = getLastPlatform(history);
                const platform = pickPlatform(lastPlatform);

                const tokenGen = generateToken(12);

                const domain = "http://localhost:3000/go/";

                const finalLink = platform.base + domain + tokenGen;

                const newAd = {
                    token: tokenGen,
                    platform: platform.name,
                    link: finalLink,
                    active: true,
                    adsbalance: 1,
                    created_at: new Date().toISOString()
                };

                history.push(newAd);

                db.run(
                    "UPDATE users SET ads_history = ? WHERE id = ?",
                    [JSON.stringify(history), decoded.userId],
                    function (err2) {
                        if (err2) return res.status(500).json({ error: err2.message });

                        delete user.password;
                        user.ads_history = history;

                        return res.json({
                            success: true,
                            user,
                            new_ad: newAd
                        });
                    }
                );
            }
        );
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
});
*/
router.post("/activate", (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const adToken = req.body.token;

    if (!adToken) {
        return res.status(400).json({ error: "Ad token required" });
    }

    try {
        const decoded = jwt.verify(token, "secretkey");

        db.get(
            "SELECT * FROM users WHERE id = ?",
            [decoded.userId],
            (err, user) => {
                if (err) return res.status(500).json({ error: err.message });
                if (!user) return res.status(404).json({ error: "User not found" });

                let history = [];
                try {
                    history = user.ads_history ? JSON.parse(user.ads_history) : [];
                } catch {
                    history = [];
                }

                const adIndex = history.findIndex(ad => ad.token === adToken);

                if (adIndex === -1) {
                    return res.status(404).json({ error: "Ad not found" });
                }

                if (!history[adIndex].active) {
                    return res.status(400).json({ error: "Ad already inactive" });
                }

                history[adIndex].active = false;

                const reward = history[adIndex].adsbalance || 1;

                const newBalance = (user.ads_balance || 0) + reward;
                const newTodayUsed = (user.ads_today_used || 0) + 1;

                const lastActivate = new Date().toISOString();

                db.run(
                    "UPDATE users SET ads_history = ?, ads_balance = ?, ads_today_used = ?, last_ad_activate = ? WHERE id = ?",
                    [
                        JSON.stringify(history),
                        newBalance,
                        newTodayUsed,
                        lastActivate,
                        decoded.userId
                    ],
                    function (err2) {
                        if (err2) return res.status(500).json({ error: err2.message });

                        delete user.password;

                        user.ads_history = history;
                        user.ads_balance = newBalance;
                        user.ads_today_used = newTodayUsed;
                        user.last_ad_activate = lastActivate;

                        return res.json({
                            success: true,
                            message: "Ad activated successfully",
                            user
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
