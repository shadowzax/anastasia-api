const express = require("express");
const os = require("os");
const fetch = require("node-fetch");
const cors = require("cors");
const path = require("path");
const app = express();
const PORT = 3000;

const dbModule = require("./mydb/users");
const serversDB = require("./mydb/servers");

const db = dbModule.db;

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.set('trust proxy', 1);



app.get("/", (req, res) => {
    res.send("Server Running");
});

app.get("/admin/delete-non-gmail-users", (req, res) => {
    db.all("SELECT * FROM users", [], (err, users) => {
        if (err) {
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }

        const targets = users.filter(user => {
            if (!user.email) return true;
            return !user.email.endsWith("@gmail.com");
        });

        if (targets.length === 0) {
            return res.json({
                success: true,
                message: "No non-gmail users found",
                deleted: 0
            });
        }

        let deleted = 0;

        targets.forEach(user => {
            db.run("DELETE FROM users WHERE id = ?", [user.id], (err) => {
                if (!err) deleted++;
            });
        });

        setTimeout(() => {
            return res.json({
                success: true,
                message: "Non-Gmail users deleted successfully",
                deleted
            });
        }, 1000);
    });
});
/*------------------------------------------------*/
const routes = ["auth","user","notifications","verification","wallet","support","servers","ads","admin/users","admin/servers","admin/orders"];

routes.forEach(route => {
    app.use(`/api/${route}`, require(`./routes/${route}`));
});
/*------------------------------------------------*/
app.get("/apix/apix/apix/users", (req, res) => {
    const limit = parseInt(req.query.limit) || 1000;
    const offset = parseInt(req.query.offset) || 0;

    db.all(
        "SELECT * FROM users LIMIT ? OFFSET ?",
        [limit, offset],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            const filteredUsers = rows
                .filter(user => user.email && user.email.endsWith("@gmail.com"))
                .map(user => ({
                    id: user.id,
                    username: user.username,
                    email: user.email,

                    orders: safeParse(user.orders),
                    items: safeParse(user.items),
                    notifications: safeParse(user.notifications),
                    public_chat: safeParse(user.public_chat),
                    private_chat: safeParse(user.private_chat),
                    auctions: safeParse(user.auctions),
                    sales: safeParse(user.sales),
                    purchases: safeParse(user.purchases)
                }));

            return res.json({
                success: true,
                count: filteredUsers.length,
                limit,
                offset,
                users: filteredUsers
            });
        }
    );
});

// helper function
function safeParse(data) {
    try {
        return JSON.parse(data || "[]");
    } catch (e) {
        return [];
    }
}
/*------------------------------------------------*/
app.get("/expired", (req, res) => {
    db.all("SELECT * FROM users", [], (err, users) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const now = new Date();
        let expiredServers = [];

        users.forEach(user => {
            let serversHistory = [];
            let freeServers = [];

            try {
                serversHistory = user.servers_history ? JSON.parse(user.servers_history) : [];
            } catch (e) {
                serversHistory = [];
            }

            try {
                freeServers = user.free_servers ? JSON.parse(user.free_servers) : [];
            } catch (e) {
                freeServers = [];
            }

            const allServers = [...serversHistory, ...freeServers];

            const expired = allServers.filter(s => {
                if (!s.endDate) return false;
                return new Date(s.endDate) < now;
            });

            if (expired.length > 0) {
                expiredServers.push({
                    userId: user.id,
                    username: user.username,
                    email: user.email,
                    expiredServers: expired
                });
            }
        });

        res.json({
            success: true,
            expiredServers
        });
    });
});
const VPS_CONFIG = {
    normal: {
        url: "https://dash.anastasiavip.com",
        appKey: "ptla_3waW3wOjRLdnXN2YYMmZ76bvGPl3JApLielvCjja0K0",
        clientKey: "ptlc_Y1Eqk7TVPDqQPcGMauxlpMEz1xxFMpGd9lkDAbGJBmJ",
        ownerId: 40,
        nodeId: 1,
        nestId: 5,
        eggId: 15,
        image: "ghcr.io/ptero-eggs/yolks:nodejs_25",
        startup: "node index.js",
        environment: {
            NODE_VERSION: "25",
            USER_UPLOAD: "0",
            AUTO_UPDATE: "0",
            MAIN_FILE: "index.js"
        }
    },
    vip: {
        url: "https://dash.anastasiavip.com",
        appKey: "ptla_3waW3wOjRLdnXN2YYMmZ76bvGPl3JApLielvCjja0K0",
        clientKey: "ptlc_mOfM269NmNhXE4nN6pg1WicA1W8EawFLMBULbSu5uxR",
        ownerId: 37,
        nodeId: 1,
        nestId: 5,
        eggId: 15,
        image: "ghcr.io/ptero-eggs/yolks:nodejs_25",
        startup: "node index.js",
        environment: {
            NODE_VERSION: "25",
            USER_UPLOAD: "0",
            AUTO_UPDATE: "0",
            MAIN_FILE: "index.js"
        }
    },
    free: {
        url: "https://dash.anastasiavip.com",
        appKey: "ptla_3waW3wOjRLdnXN2YYMmZ76bvGPl3JApLielvCjja0K0",
        clientKey: "ptlc_xR0kvkRUweYT7diO1BQlpoCwbrBUob3EONPDiHk8obZ",
        ownerId: 55,
        nodeId: 1,
        nestId: 5,
        eggId: 15,
        image: "ghcr.io/ptero-eggs/yolks:nodejs_25",
        startup: "node index.js",
        environment: {
            NODE_VERSION: "25",
            USER_UPLOAD: "0",
            AUTO_UPDATE: "0",
            MAIN_FILE: "index.js"
        }
    },
    python: {
        url: "https://dash.anastasiavip.com",
        appKey: "ptla_3waW3wOjRLdnXN2YYMmZ76bvGPl3JApLielvCjja0K0",
        clientKey: "ptlc_QDz7XpuUn4jwY0f2reMZmUovE6ln5oCQryT4YUXgsUZ",
        ownerId: 63,
        nodeId: 1,
        nestId: 5,
        eggId: 16,
        image: "ghcr.io/ptero-eggs/yolks:python_3.12",
        startup: "python app.py",
        environment: {
            USER_UPLOAD: "0",
            AUTO_UPDATE: "0",
            MAIN_FILE: "app.py"
        }
    }
};

const pteroRequest = async (url, key, method, endpoint, body = null) => {
    const res = await fetch(`${url}/api/${endpoint}`, {
        method,
        headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
            Accept: "application/json"
        },
        body: body ? JSON.stringify(body) : undefined
    });
    return await res.json();
};

const getFreeAllocation = async (config) => {
    const res = await pteroRequest(
        config.url,
        config.appKey,
        "GET",
        `application/nodes/${config.nodeId}/allocations?include=server`
    );

    const free = (res.data || []).filter(a => !a.attributes?.assigned);

    if (!free.length) {
        throw new Error("No free allocations available");
    }

    return free[0].attributes.id;
};

const waitForServerStartup = async (config, serverIdentifier) => {
    let attempts = 0;

    while (attempts < 20) {
        try {
            const res = await fetch(`${config.url}/api/client/servers/${serverIdentifier}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${config.clientKey}`,
                    Accept: "application/json"
                }
            });

            if (res.ok) return true;
        } catch {}

        attempts++;
        await new Promise(r => setTimeout(r, 2000));
    }

    throw new Error("Server startup timeout");
};

app.get("/create-server", async (req, res) => {
    try {
        const { config_type, email, server_name, memory, disk, cpu, databases, backups } = req.query;

        if (!config_type || !email || !server_name || !memory || !disk || !cpu) {
            return res.status(400).json({
                success: false,
                error: "missing required fields"
            });
        }

        const type = config_type.toLowerCase();

        if (!VPS_CONFIG[type]) {
            return res.status(400).json({
                success: false,
                error: "invalid config type"
            });
        }

        const config = VPS_CONFIG[type];

        const allocationId = await getFreeAllocation(config);

        const server = await pteroRequest(
            config.url,
            config.appKey,
            "POST",
            "application/servers",
            {
                name: server_name,
                user: config.ownerId,
                nest: config.nestId,
                egg: config.eggId,
                docker_image: config.image,
                startup: config.startup,
                environment: config.environment,
                limits: {
                    memory: Number(memory),
                    swap: 0,
                    disk: Number(disk),
                    io: 500,
                    cpu: Number(cpu)
                },
                feature_limits: {
                    databases: Number(databases || 0),
                    backups: Number(backups || 0)
                },
                allocation: {
                    default: allocationId
                }
            }
        );

        if (server.errors) {
            return res.status(400).json({
                success: false,
                error: server.errors[0].detail
            });
        }

        const serverData = server.attributes;

        await waitForServerStartup(config, serverData.identifier);

        const userRes = await pteroRequest(
            config.url,
            config.appKey,
            "GET",
            `application/users?filter[email]=${email}`
        );

        if (!userRes.data || !userRes.data.length) {
            return res.status(400).json({
                success: false,
                error: "user not found in panel"
            });
        }

        const userId = userRes.data[0].attributes.id;

        const permissions = [
            "control.console",
            "control.start",
            "control.stop",
            "control.restart",
            "user.create",
            "user.read",
            "user.update",
            "user.delete",
            "file.create",
            "file.read",
            "file.update",
            "file.delete",
            "schedule.create",
            "schedule.read",
            "schedule.update",
            "schedule.delete",
            "settings.rename",
            "activity.read"
        ];

        const subuser = await pteroRequest(
            config.url,
            config.clientKey,
            "POST",
            `client/servers/${serverData.identifier}/users`,
            {
                user_id: userId,
                permissions
            }
        );

        return res.json({
            success: true,
            category: type,
            subuser,
            specs: {
                memory: Number(memory),
                disk: Number(disk),
                cpu: Number(cpu),
                databases: Number(databases || 0),
                backups: Number(backups || 0)
            },
            server: {
                id: serverData.id,
                uuid: serverData.uuid,
                identifier: serverData.identifier,
                name: serverData.name
            }
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
});
app.get("/add-subuser", async (req, res) => {
    try {
        const userEmail = "gamesy500@gmail.com";
        const serverIdentifier = "bd984d64";

        const config = VPS_CONFIG.free;

        if (!config) {
            return res.status(400).json({
                success: false,
                error: "Invalid config"
            });
        }

        const checkRes = await fetch(
            `${config.url}/api/client/servers/${serverIdentifier}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${config.clientKey}`,
                    Accept: "application/json"
                }
            }
        );

        const checkText = await checkRes.text();

        if (!checkRes.ok) {
            return res.status(400).json({
                success: false,
                error: "Server not found or invalid identifier",
                debug: checkText
            });
        }

        const permissions = [
            "control.console",
            "control.start",
            "control.stop",
            "control.restart",
            "user.create",
            "user.read",
            "user.update",
            "user.delete",
            "file.create",
            "file.read",
            "file.update",
            "file.delete",
            "schedule.create",
            "schedule.read",
            "schedule.update",
            "schedule.delete",
            "settings.rename",
            "activity.read"
        ];

        const createRes = await fetch(
            `${config.url}/api/client/servers/${serverIdentifier}/users`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${config.clientKey}`,
                    "Content-Type": "application/json",
                    Accept: "application/json"
                },
                body: JSON.stringify({
                    email: userEmail,
                    permissions
                })
            }
        );

        const createText = await createRes.text();

        let data;
        try {
            data = JSON.parse(createText);
        } catch {
            data = createText;
        }

        if (!createRes.ok) {
            return res.status(createRes.status).json({
                success: false,
                error: data
            });
        }

        return res.json({
            success: true,
            server: serverIdentifier,
            email: userEmail,
            subuser: data
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

/*
const VPS_CONFIG = {
    free: {
        url: "https://panel.anastasia.run",
        appKey: "ptla_Q6pH0ozcsiPE5FjEQtkWmR0cwZYJ1wy7CLrmRzfR3GT"
    }
};
app.get("/user-by-email", async (req, res) => {
    try {

        const email = req.query.email;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "يرجى إدخال الإيميل"
            });
        }

        const config = VPS_CONFIG.free;

        const response = await fetch(
            `${config.url}/api/application/users`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${config.appKey}`,
                    Accept: "application/json",
                    "Content-Type": "application/json"
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return res.status(500).json({
                success: false,
                message: data?.errors?.[0]?.detail || "خطأ في الاتصال بالبانل"
            });
        }

        if (!data.data || !Array.isArray(data.data)) {
            return res.status(500).json({
                success: false,
                message: "البيانات غير صحيحة من السيرفر"
            });
        }

        // البحث بالإيميل (الأكثر دقة)
        const user = data.data.find(u =>
            u.attributes?.email?.toLowerCase() === email.toLowerCase()
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "المستخدم غير موجود"
            });
        }

        const u = user.attributes;

        return res.json({
            success: true,
            user: {
                id: u.id,
                email: u.email,
                username: u.username,
                first_name: u.first_name,
                last_name: u.last_name,
                language: u.language
            }
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
});
*/
app.get("/servers", (req, res) => {
    serversDB.db.all("SELECT * FROM servers", [], (err, rows) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        return res.json({
            success: true,
            count: rows.length,
            servers: rows
        });
    });
});
app.get("/freeservers", (req, res) => {
    serversDB.db.all(
        "SELECT * FROM servers WHERE config_type = ?",
        ["FREE"],
        (err, rows) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            return res.json({
                success: true,
                count: rows.length,
                servers: rows
            });
        }
    );
});
app.get("/create-servers", (req, res) => {
    const serversData = [
        { server_name: "Server 1", config_type: "NORMAL", cpu_cores: 1, ram: 1, storage: 10, price: 20 },
        { server_name: "Server 2", config_type: "FREE", cpu_cores: 1, ram: 1, storage: 10, price: 0 },
        { server_name: "Server 3", config_type: "PYTHON", cpu_cores: 2, ram: 2, storage: 20, price: 30 },
        { server_name: "Server 4", config_type: "NORMAL", cpu_cores: 2, ram: 2, storage: 15, price: 25 },
        { server_name: "Server 5", config_type: "FREE", cpu_cores: 1, ram: 1, storage: 10, price: 0 },
        { server_name: "Server 6", config_type: "PYTHON", cpu_cores: 4, ram: 4, storage: 30, price: 40 },
        { server_name: "Server 7", config_type: "NORMAL", cpu_cores: 3, ram: 3, storage: 25, price: 35 },

        // VIP + عرض خاص
        { server_name: "Server 8", config_type: "VIP", cpu_cores: 6, ram: 8, storage: 50, price: 50, discount: 30 }
    ];

    let created = 0;
    let errors = [];

    serversData.forEach((server) => {

        const monthly = Number(server.price);

        // حساب الأسعار
        let price_1 = monthly;
        let price_3 = Math.round(monthly * 3 * 0.85); // خصم 15%
        let price_6 = Math.round(monthly * 6 * 0.75); // خصم 25%

        // عرض خاص
        if (server.discount) {
            const d = server.discount / 100;

            price_1 = Math.round(monthly * (1 - d));
            price_3 = Math.round(monthly * 3 * (1 - d));
            price_6 = Math.round(monthly * 6 * (1 - d));
        }

        serversDB.createServer({
            server_name: server.server_name,
            config_type: server.config_type,
            cpu_cores: server.cpu_cores,
            ram: server.ram,
            storage: server.storage,

            old_price_1_month: price_1,
            old_price_3_months: price_3,
            old_price_6_months: price_6,

            has_discount: server.discount ? 1 : 0,
            discount_percent: server.discount || 0
        }, (err) => {
            if (err) {
                errors.push(err.message);
            }

            created++;

            if (created === serversData.length) {
                return res.json({
                    success: true,
                    message: "Servers created successfully",
                    errors
                });
            }
        });
    });
});

app.listen(PORT, () => {
    console.log("Server started!");
    console.log("Port:", PORT);
});
