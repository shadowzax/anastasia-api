const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const dataFolder = path.join(__dirname, "..", "data");

if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder);
}

const dbPath = path.join(dataFolder, "servers.sqlite");

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log("Connected to servers database.");
    }
});

function generateServerId() {
    return Math.floor(100000000 + Math.random() * 900000000).toString();
}

function calculateDiscount(price, discountPercent) {
    return Number((Number(price) - (Number(price) * Number(discountPercent) / 100)).toFixed(2));
}

function deleteServer(id, callback) {
    db.run(
        `DELETE FROM servers WHERE id = ?`,
        [String(id)],
        function (err) {
            if (err) {
                return callback(err);
            }

            if (this.changes === 0) {
                return callback(new Error("Server not found"));
            }

            callback(null, { affected: this.changes });
        }
    );
}

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS servers (
            id TEXT PRIMARY KEY,
            server_name TEXT,
            config_type TEXT DEFAULT 'NORMAL'
            CHECK(config_type IN ('NORMAL', 'VIP', 'FREE', 'PYTHON')),

            cpu_cores INTEGER DEFAULT 1,
            ram TEXT DEFAULT '1GB',
            storage TEXT DEFAULT '10GB',

            server_cpu_cores INTEGER DEFAULT 100,
            server_ram INTEGER DEFAULT 1024,
            server_storage INTEGER DEFAULT 10240,

            support_24h INTEGER DEFAULT 1,
            vip_file INTEGER DEFAULT 0,
            limited_offer INTEGER DEFAULT 0,

            has_discount INTEGER DEFAULT 0,
            discount_percent INTEGER DEFAULT 0,

            old_price_1_month REAL DEFAULT 0,
            old_price_3_months REAL DEFAULT 0,
            old_price_6_months REAL DEFAULT 0,

            new_price_1_month REAL DEFAULT 0,
            new_price_3_months REAL DEFAULT 0,
            new_price_6_months REAL DEFAULT 0,

            status TEXT DEFAULT 'active',

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    const requiredColumns = {
        server_name: "TEXT",
        config_type: "TEXT DEFAULT 'NORMAL' CHECK(config_type IN ('NORMAL', 'VIP', 'FREE', 'PYTHON'))",
        cpu_cores: "INTEGER DEFAULT 1",
        ram: "TEXT DEFAULT '1GB'",
        storage: "TEXT DEFAULT '10GB'",
        server_cpu_cores: "INTEGER DEFAULT 100",
        server_ram: "INTEGER DEFAULT 1024",
        server_storage: "INTEGER DEFAULT 10240",
        support_24h: "INTEGER DEFAULT 1",
        vip_file: "INTEGER DEFAULT 0",
        limited_offer: "INTEGER DEFAULT 0",
        has_discount: "INTEGER DEFAULT 0",
        discount_percent: "INTEGER DEFAULT 0",
        old_price_1_month: "REAL DEFAULT 0",
        old_price_3_months: "REAL DEFAULT 0",
        old_price_6_months: "REAL DEFAULT 0",
        new_price_1_month: "REAL DEFAULT 0",
        new_price_3_months: "REAL DEFAULT 0",
        new_price_6_months: "REAL DEFAULT 0",
        status: "TEXT DEFAULT 'active'",
        created_at: "DATETIME DEFAULT CURRENT_TIMESTAMP"
    };

    db.all(`PRAGMA table_info(servers)`, (err, columns) => {
        if (err) return console.error(err.message);

        const existing = columns.map(col => col.name);

        for (const [name, type] of Object.entries(requiredColumns)) {
            if (!existing.includes(name)) {
                db.run(`ALTER TABLE servers ADD COLUMN ${name} ${type}`);
            }
        }
    });
});

function createServer(data, callback) {
    let {
        id,
        server_name,
        config_type,
        cpu_cores,
        ram,
        storage,
        support_24h,
        vip_file,
        limited_offer,
        has_discount,
        discount_percent,
        old_price_1_month,
        old_price_3_months,
        old_price_6_months,
        status
    } = data;

    cpu_cores = Number(cpu_cores || 1);
    ram = Number(ram || 1);
    storage = Number(storage || 10);

    const server_cpu_cores = cpu_cores * 100;
    const server_ram = cpu_cores * 1024;
    const server_storage = storage * 1024;

    const ram_display = `${ram}GB`;
    const storage_display = `${storage}GB`;

    let new_price_1_month = Number(old_price_1_month || 0);
    let new_price_3_months = Number(old_price_3_months || 0);
    let new_price_6_months = Number(old_price_6_months || 0);

    if (has_discount) {
        new_price_1_month = calculateDiscount(old_price_1_month, discount_percent);
        new_price_3_months = calculateDiscount(old_price_3_months, discount_percent);
        new_price_6_months = calculateDiscount(old_price_6_months, discount_percent);
    }

    db.run(
        `INSERT INTO servers (
            id,
            server_name,
            config_type,
            cpu_cores,
            ram,
            storage,
            server_cpu_cores,
            server_ram,
            server_storage,
            support_24h,
            vip_file,
            limited_offer,
            has_discount,
            discount_percent,
            old_price_1_month,
            old_price_3_months,
            old_price_6_months,
            new_price_1_month,
            new_price_3_months,
            new_price_6_months,
            status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            id || generateServerId(),
            server_name,
            config_type || "NORMAL",
            cpu_cores,
            ram_display,
            storage_display,
            server_cpu_cores,
            server_ram,
            server_storage,
            support_24h ? 1 : 0,
            vip_file ? 1 : 0,
            limited_offer ? 1 : 0,
            has_discount ? 1 : 0,
            discount_percent || 0,
            old_price_1_month || 0,
            old_price_3_months || 0,
            old_price_6_months || 0,
            new_price_1_month,
            new_price_3_months,
            new_price_6_months,
            status || "active"
        ],
        callback
    );
}

module.exports = {
    db,
    generateServerId,
    createServer,
    calculateDiscount,
    deleteServer
};