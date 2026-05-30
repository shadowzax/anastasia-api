const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const dataFolder = path.join(__dirname, "..", "data");

if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder);
}

const dbPath = path.join(dataFolder, "users.sqlite");

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error(err.message);
    else console.log("Connected to database.");
});

const defaultImage = "https://i.ibb.co/WNSTVC8T/i-wasn-t-ready-for-this-flashback-anime-blue-lock-s2-character-rin-rules-feel-free-to.jpg";

const ADS_LIMIT = 8;

db.serialize(() => {

    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT,
            email TEXT UNIQUE,
            password TEXT,
            plain_password TEXT,
            country TEXT,
            verification_code TEXT,
            rank TEXT DEFAULT 'مستخدم',
            level INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            servers_history TEXT DEFAULT '[]',
            sales TEXT DEFAULT '[]',
            purchases TEXT DEFAULT '[]',
            items TEXT DEFAULT '[]',
            support_tickets TEXT DEFAULT '[]',
            is_verified INTEGER DEFAULT 0,
            is_admin INTEGER DEFAULT 0,
            balance REAL DEFAULT 0,
            notifications TEXT DEFAULT '[]',
            profile_image TEXT DEFAULT '${defaultImage}',
            public_chat TEXT DEFAULT '[]',
            private_chat TEXT DEFAULT '[]',
            auctions TEXT DEFAULT '[]',
            last_operation TEXT,
            account_type TEXT DEFAULT 'مستخدم',
            last_daily_gift TEXT,
            free_servers TEXT DEFAULT '[]',
            wallet_operations TEXT DEFAULT '[]',
            ads_balance INTEGER DEFAULT 0,
            ads_limit_today INTEGER DEFAULT ${ADS_LIMIT},
            ads_today_used INTEGER DEFAULT 0,
            last_ad_activate TEXT,
            ads_history TEXT DEFAULT '[]',
            orders TEXT DEFAULT '[]'
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId TEXT,
            serverName TEXT,
            serverId TEXT,
            identifier TEXT,
            category TEXT,
            memory INTEGER,
            disk INTEGER,
            cpu INTEGER,
            databases INTEGER DEFAULT 0,
            backups INTEGER DEFAULT 0,
            price REAL,
            planMonths INTEGER,
            startDate TEXT,
            endDate TEXT,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

});

function generateId() {
    return Math.floor(100000000 + Math.random() * 900000000).toString();
}

function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function canActivateAd(user, callback) {
    const today = new Date().toISOString().split("T")[0];

    let lastDate = null;

    if (user.last_ad_activate) {
        lastDate = new Date(user.last_ad_activate).toISOString().split("T")[0];
    }

    let usedToday = Number(user.ads_today_used || 0);

    if (lastDate !== today) {
        usedToday = 0;

        db.run(
            `UPDATE users SET ads_today_used = 0 WHERE id = ?`,
            [user.id]
        );
    }

    const limit = Number(user.ads_limit_today || ADS_LIMIT);

    if (usedToday >= limit) {
        return callback({
            success: false,
            message: "تم الوصول للحد اليومي للإعلانات"
        });
    }

    callback({ success: true });
}

function addAdsBalance(userId, amount, platform, code, callback) {
    db.get(
        `SELECT * FROM users WHERE id = ?`,
        [userId],
        (err, user) => {
            if (err || !user) {
                return callback(err || "User not found");
            }

            canActivateAd(user, (result) => {
                if (!result.success) {
                    return callback(result);
                }

                const history = JSON.parse(user.ads_history || "[]");

                history.push({
                    code,
                    platform,
                    amount,
                    date: new Date().toISOString()
                });

                const newBalance =
                    Number(user.ads_balance || 0) + Number(amount);

                const todayUsed =
                    Number(user.ads_today_used || 0) + 1;

                db.run(
                    `
                    UPDATE users
                    SET ads_balance = ?,
                        ads_today_used = ?,
                        last_ad_activate = ?,
                        ads_history = ?
                    WHERE id = ?
                    `,
                    [
                        newBalance,
                        todayUsed,
                        new Date().toISOString(),
                        JSON.stringify(history),
                        userId
                    ],
                    (updateErr) => {
                        if (updateErr) {
                            return callback(updateErr);
                        }

                        callback(null, {
                            success: true,
                            ads_balance: newBalance,
                            ads_today_used: todayUsed
                        });
                    }
                );
            });
        }
    );
}

module.exports = {
    db,
    generateId,
    generateCode,
    canActivateAd,
    addAdsBalance
};
