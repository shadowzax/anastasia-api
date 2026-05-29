const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const dataFolder = path.join(__dirname, "..", "data");

if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder);
}

const dbPath = path.join(dataFolder, "ads.sqlite");

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log("Connected to ads database.");
    }
});

let domain = "http://localhost:3000";

const platforms = {
    shrinkme: [
        "548b4e82a510e52828e24efec9aef87f4d109fed"
    ],

    uii: [
        "9596b5b6794a02c75aac16e23567570498d3ae37"
    ],

    exe: [
        "4c625be6b11d02ade39a10a943f08bf1ab8f4167",
        "59298b758103705b7322c724cf709cdc7a96479d"
    ]
};

function generateAdCode(length = 12) {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    let result = "";

    for (let i = 0; i < length; i++) {
        result += chars.charAt(
            Math.floor(Math.random() * chars.length)
        );
    }

    return result;
}

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS ads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,

            code TEXT UNIQUE,

            user_id TEXT,

            platform TEXT
            CHECK(platform IN ('exe', 'uii', 'shrinkme')),

            api_key TEXT,

            ads_point INTEGER DEFAULT 1,

            short_url TEXT,
            destination_url TEXT,

            is_used INTEGER DEFAULT 0,
            used_by TEXT DEFAULT NULL,

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
});

async function createAd(userId, platform, adsPoint = 1) {
    try {

        if (!platforms[platform]) {
            return {
                success: false,
                message: "Invalid platform"
            };
        }

        const apiKeys = platforms[platform];

        const apiKey =
            apiKeys[Math.floor(Math.random() * apiKeys.length)];

        const code = generateAdCode();

        const destinationUrl =
            `${domain}/ads/redeem/${code}`;

        const endpoint =
            `https://${platform}.io/st?api=${apiKey}&url=${encodeURIComponent(destinationUrl)}`;

        const response = await fetch(endpoint);

        const data = await response.json();

        const shortUrl =
            data.shortenedUrl ||
            data.shortened_url ||
            data.shortenedUrl;

        if (!shortUrl) {
            return {
                success: false,
                message: "Failed to create short link"
            };
        }

        await new Promise((resolve, reject) => {

            db.run(
                `INSERT INTO ads (
                    code,
                    user_id,
                    platform,
                    api_key,
                    ads_point,
                    short_url,
                    destination_url
                ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    code,
                    userId,
                    platform,
                    apiKey,
                    adsPoint,
                    shortUrl,
                    destinationUrl
                ],
                (err) => {

                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }

                }
            );

        });

        return {
            success: true,
            code,
            short_url: shortUrl,
            ads_point: adsPoint,
            platform
        };

    } catch (error) {

        return {
            success: false,
            message: error.message
        };

    }
}

module.exports = {
    db,
    createAd,
    generateAdCode
};