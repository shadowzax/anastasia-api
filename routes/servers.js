const express = require("express");
const jwt = require("jsonwebtoken");
const dbModule = require("../mydb/users");
const serversDB = require("../mydb/servers");

const router = express.Router();
const db = dbModule.db;

router.post("/create-db-server", (req, res) => {
    const {
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
    } = req.body;

    if (!server_name) {
        return res.status(400).json({
            success: false,
            error: "server_name is required"
        });
    }

    serversDB.createServer(
        {
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
        },
        (err) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    error: err.message
                });
            }

            return res.json({
                success: true,
                message: "Server created successfully"
            });
        }
    );
});

router.delete("/delete-server/:id", (req, res) => {
    const id = String(req.params.id);

    serversDB.deleteServer(id, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }

        return res.json({
            success: true,
            message: "Server deleted successfully"
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
        startup: 'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; if [[ "${MAIN_FILE}" == *.js ]]; then /usr/local/bin/node "/home/container/${MAIN_FILE}" ${NODE_ARGS}; else /usr/local/bin/ts-node --esm "/home/container/${MAIN_FILE}" ${NODE_ARGS}; fi',
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
        startup: 'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; if [[ "${MAIN_FILE}" == *.js ]]; then /usr/local/bin/node "/home/container/${MAIN_FILE}" ${NODE_ARGS}; else /usr/local/bin/ts-node --esm "/home/container/${MAIN_FILE}" ${NODE_ARGS}; fi',
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
        startup: 'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; if [[ "${MAIN_FILE}" == *.js ]]; then /usr/local/bin/node "/home/container/${MAIN_FILE}" ${NODE_ARGS}; else /usr/local/bin/ts-node --esm "/home/container/${MAIN_FILE}" ${NODE_ARGS}; fi',
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
        startup: 'if [[ -d .git ]] && [[ "{{AUTO_UPDATE}}" == "1" ]]; then git pull; fi; if [[ ! -z "{{PY_PACKAGES}}" ]]; then pip install -U --prefix .local {{PY_PACKAGES}}; fi; if [[ -f /home/container/${REQUIREMENTS_FILE} ]]; then pip install -U --prefix .local -r ${REQUIREMENTS_FILE}; fi; /usr/local/bin/python /home/container/{{PY_FILE}}',
        environment: {
            USER_UPLOAD: "0",
            AUTO_UPDATE: "0",
            MAIN_FILE: "app.py",
            PY_FILE: "app.py",
            REQUIREMENTS_FILE: "requirements.txt"
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


router.post("/create-free-servers", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ success: false, error: "No token provided" });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ success: false, error: "Invalid token format" });
        }

        let decoded;

        try {
            decoded = jwt.verify(token, "secretkey");
        } catch (err) {
            return res.status(401).json({ success: false, error: "Invalid or expired token" });
        }

        const userId = decoded.userId;

        const user = await new Promise((resolve, reject) => {
            db.get("SELECT * FROM users WHERE id = ?", [userId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!user) {
            return res.status(401).json({ success: false, error: "User not found" });
        }

        const { server_name } = req.body;

        if (!server_name) {
            return res.status(400).json({ success: false, error: "server_name required" });
        }

        if (!user.ads_balance || user.ads_balance < 2) {
            return res.status(400).json({ success: false, error: "insufficient ads_balance (minimum 2 required)" });
        }

        const config = VPS_CONFIG.free;

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
                    memory: 1024,
                    swap: 0,
                    disk: 2048,
                    io: 500,
                    cpu: 100
                },
                feature_limits: {
                    databases: 0,
                    backups: 0
                },
                allocation: {
                    default: allocationId
                }
            }
        );

        if (server?.errors) {
            return res.status(400).json({
                success: false,
                error: "pterodactyl error",
                details: server.errors
            });
        }

        const serverData = server.attributes;

        let serverActive = false;

        try {
            const resources = await pteroRequest(
                config.url,
                config.clientKey,
                "GET",
                `client/servers/${serverData.identifier}/resources`
            );

            serverActive = resources.attributes.current_state === "running";
        } catch (e) {
            serverActive = false;
        }

        const startDate = new Date();
        const endDate = new Date(Date.now() + 4 * 60 * 60 * 1000);

        let freeServers = [];

        try {
            freeServers = Array.isArray(user.free_servers)
                ? user.free_servers
                : JSON.parse(user.free_servers || "[]");
        } catch (e) {
            freeServers = [];
        }

        freeServers.push({
            serverId: serverData.id,
            identifier: serverData.identifier,
            name: server_name,
            memory: 1024,
            disk: 2048,
            cpu: 100,
            active: true,
            server_active: serverActive,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
        });

        await new Promise((resolve, reject) => {
            db.run(
                "UPDATE users SET free_servers = ?, ads_balance = ads_balance - 2 WHERE id = ?",
                [JSON.stringify(freeServers), user.id],
                function (err) {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        return res.json({
            success: true,
            server: {
                id: serverData.id,
                identifier: serverData.identifier,
                name: server_name
            },
            free_servers: freeServers,
            ads_balance: user.ads_balance - 2
        });

    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});
router.post("/create-server", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                error: "No token provided"
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                error: "Invalid token format"
            });
        }

        let decoded;

        try {
            decoded = jwt.verify(token, "secretkey");
        } catch (err) {
            return res.status(401).json({
                success: false,
                error: "Invalid or expired token"
            });
        }

        const userId = decoded.userId;

        const user = await new Promise((resolve, reject) => {
            db.get("SELECT * FROM users WHERE id = ?", [userId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                error: "User not found"
            });
        }

        const {
            config_type,
            server_name,
            memory,
            disk,
            cpu,
            databases,
            backups,
            price,
            months
        } = req.body;

        const missingFields = [];

        if (!config_type) missingFields.push("config_type");
        if (!server_name) missingFields.push("server_name");
        if (!memory) missingFields.push("memory");
        if (!disk) missingFields.push("disk");
        if (!cpu) missingFields.push("cpu");
        if (!months) missingFields.push("months");

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                error: "missing required fields",
                details: {
                    missingFields,
                    receivedBody: req.body
                }
            });
        }

        const type = config_type.toLowerCase();

        if (!VPS_CONFIG[type]) {
            return res.status(400).json({
                success: false,
                error: "invalid config type",
                details: {
                    config_type,
                    availableTypes: Object.keys(VPS_CONFIG)
                }
            });
        }

        const config = VPS_CONFIG[type];

        const finalPrice = Number(price || 0);
        const finalMonths = Number(months);

        if (finalPrice < 0) {
            return res.status(400).json({
                success: false,
                error: "invalid price",
                details: { price }
            });
        }

        if (!finalMonths || finalMonths <= 0) {
            return res.status(400).json({
                success: false,
                error: "invalid subscription duration",
                details: { months }
            });
        }

        if (finalPrice > 0 && user.balance < finalPrice) {
            return res.status(400).json({
                success: false,
                error: "insufficient balance",
                details: {
                    balance: user.balance,
                    required: finalPrice
                }
            });
        }

        if (finalPrice > 0) {
            await new Promise((resolve, reject) => {
                db.run(
                    "UPDATE users SET balance = balance - ? WHERE id = ?",
                    [finalPrice, user.id],
                    function (err) {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
        }

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
                error: "pterodactyl error",
                details: server.errors
            });
        }

        const serverData = server.attributes;

        let serverActive = false;

        try {
            const resources = await pteroRequest(
                config.url,
                config.clientKey,
                "GET",
                `client/servers/${serverData.identifier}/resources`
            );

            serverActive = resources.attributes.current_state === "running";
        } catch (e) {
            serverActive = false;
        }

        const startDate = new Date();
        const endDate = new Date();

        endDate.setMonth(endDate.getMonth() + finalMonths);

        const historyEntry = {
            serverId: serverData.id,
            identifier: serverData.identifier,
            name: serverData.name,
            category: type,
            memory,
            disk,
            cpu,
            databases: databases || 0,
            backups: backups || 0,
            price: finalPrice,
            months: finalMonths,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            status: "active",
            server_active: serverActive,
            created_at: new Date().toISOString()
        };

        await new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO orders (
                    userId,
                    serverName,
                    serverId,
                    identifier,
                    category,
                    memory,
                    disk,
                    cpu,
                    databases,
                    backups,
                    price,
                    planMonths,
                    startDate,
                    endDate,
                    status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    user.id,
                    server_name,
                    serverData.id,
                    serverData.identifier,
                    type,
                    memory,
                    disk,
                    cpu,
                    databases || 0,
                    backups || 0,
                    finalPrice,
                    finalMonths,
                    startDate.toISOString(),
                    endDate.toISOString(),
                    "active"
                ],
                function (err) {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        let updatedHistory = [];

        try {
            updatedHistory = Array.isArray(user.servers_history)
                ? user.servers_history
                : JSON.parse(user.servers_history || "[]");
        } catch (e) {
            updatedHistory = [];
        }

        updatedHistory.push(historyEntry);

        await new Promise((resolve, reject) => {
            db.run(
                "UPDATE users SET servers_history = ? WHERE id = ?",
                [JSON.stringify(updatedHistory), user.id],
                function (err) {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        return res.json({
            success: true,
            category: type,
            balance: user.balance - finalPrice,
            order: {
                price: finalPrice,
                planMonths: finalMonths,
                startDate,
                endDate,
                server_active: serverActive
            },
            server: {
                id: serverData.id,
                uuid: serverData.uuid,
                identifier: serverData.identifier,
                name: serverData.name,
                active: serverActive
            }
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message,
            details: err.stack
        });
    }
});

/*______________________________________________________*/
router.post("/add-free-subuser", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                error: "No token provided"
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                error: "Invalid token format"
            });
        }

        let decoded;

        try {
            decoded = jwt.verify(token, "secretkey");
        } catch (err) {
            return res.status(401).json({
                success: false,
                error: "Invalid or expired token"
            });
        }

        const userId = decoded.userId;

        const user = await new Promise((resolve, reject) => {
            db.get(
                "SELECT * FROM users WHERE id = ?",
                [userId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        const userEmail = user.email;

        if (!userEmail) {
            return res.status(400).json({
                success: false,
                error: "User email not found"
            });
        }

        const { serverIdentifier, configType } = req.body;

        if (!serverIdentifier) {
            return res.status(400).json({
                success: false,
                error: "Server identifier is required"
            });
        }

        if (!configType) {
            return res.status(400).json({
                success: false,
                error: "Config type is required"
            });
        }

        const config = VPS_CONFIG[configType];

        if (!config) {
            return res.status(400).json({
                success: false,
                error: "Invalid config type"
            });
        }

        const checkUrl = `${config.url}/api/client/servers/${serverIdentifier}`;

        const check = await fetch(checkUrl, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${config.clientKey}`,
                Accept: "application/json"
            }
        });

        const checkText = await check.text();

        let checkData;

        try {
            checkData = JSON.parse(checkText);
        } catch {
            return res.status(500).json({
                success: false,
                error: "Invalid server response",
                raw: checkText
            });
        }

        if (!check.ok) {
            return res.status(check.status).json({
                success: false,
                error: checkData
            });
        }

        const normalPerms = [
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
            "file.read-content",
            "file.update",
            "file.delete",
            "file.archive",
            "file.sftp",

            "allocation.read",

            "startup.read",
            "startup.update",

            "schedule.create",
            "schedule.read",
            "schedule.update",
            "schedule.delete",

            "settings.rename",
            "settings.reinstall",

            "activity.read"
        ];

        const subuserUrl = `${config.url}/api/client/servers/${serverIdentifier}/users`;

        const result = await fetch(subuserUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${config.clientKey}`,
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            body: JSON.stringify({
                email: userEmail,
                permissions: normalPerms
            })
        });

        const resultText = await result.text();

        let data;

        try {
            data = JSON.parse(resultText);
        } catch {
            return res.status(500).json({
                success: false,
                error: "Invalid subuser response",
                raw: resultText
            });
        }

        if (!result.ok) {
            return res.status(result.status).json({
                success: false,
                error: data
            });
        }

        let freeServers = [];

        try {
            freeServers = JSON.parse(user.free_servers || "[]");
        } catch {
            freeServers = [];
        }

        freeServers = freeServers.map(server => {
            if (server.identifier === serverIdentifier) {
                return {
                    ...server,
                    server_active: true
                };
            }

            return server;
        });

        await new Promise((resolve, reject) => {
            db.run(
                "UPDATE users SET free_servers = ? WHERE id = ?",
                [JSON.stringify(freeServers), user.id],
                function (err) {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        return res.json({
            success: true,
            configType,
            server: serverIdentifier,
            email: userEmail,
            server_active: true,
            permissions: normalPerms,
            subuser: data
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
});
router.post("/add-subuser", async (req, res) => {
    try {
        console.log("➡️ Request received /add-subuser");
        console.log("📦 Body:", req.body);
        console.log("📨 Headers:", req.headers);

        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                error: "No token provided"
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                error: "Invalid token format"
            });
        }

        let decoded;

        try {
            decoded = jwt.verify(token, "secretkey");
        } catch (err) {
            return res.status(401).json({
                success: false,
                error: "Invalid or expired token"
            });
        }

        const userId = decoded.userId;

        const user = await new Promise((resolve, reject) => {
            db.get(
                "SELECT * FROM users WHERE id = ?",
                [userId],
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                }
            );
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        const userEmail = user.email;

        if (!userEmail) {
            return res.status(400).json({
                success: false,
                error: "User email not found"
            });
        }

        const { serverIdentifier, configType } = req.body;

        if (!serverIdentifier) {
            return res.status(400).json({
                success: false,
                error: "Server identifier is required"
            });
        }

        if (!configType) {
            return res.status(400).json({
                success: false,
                error: "Config type is required"
            });
        }

        const config = VPS_CONFIG[configType];

        if (!config) {
            return res.status(400).json({
                success: false,
                error: "Invalid config type"
            });
        }

        const checkUrl = `${config.url}/api/client/servers/${serverIdentifier}`;

        const check = await fetch(checkUrl, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${config.clientKey}`,
                Accept: "application/json"
            }
        });

        const checkText = await check.text();

        let checkData;

        try {
            checkData = JSON.parse(checkText);
        } catch {
            return res.status(500).json({
                success: false,
                error: "Invalid server response",
                raw: checkText
            });
        }

        if (!check.ok) {
            return res.status(check.status).json({
                success: false,
                error: checkData
            });
        }

        const normalPerms = [
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
            "file.read-content",
            "file.update",
            "file.delete",
            "file.archive",
            "file.sftp",

            "allocation.read",

            "startup.read",
            "startup.update",

            "schedule.create",
            "schedule.read",
            "schedule.update",
            "schedule.delete",

            "settings.rename",
            "settings.reinstall",

            "activity.read"
        ];

        const vipPerms = [
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

        const permissions =
            configType.toUpperCase() === "VIP"
                ? vipPerms
                : normalPerms;

        const subuserUrl = `${config.url}/api/client/servers/${serverIdentifier}/users`;

        const result = await fetch(subuserUrl, {
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
        });

        const resultText = await result.text();

        let data;

        try {
            data = JSON.parse(resultText);
        } catch {
            return res.status(500).json({
                success: false,
                error: "Invalid subuser response",
                raw: resultText
            });
        }

        if (!result.ok) {
            return res.status(result.status).json({
                success: false,
                error: data
            });
        }

        let serversHistory = [];

        try {
            serversHistory = JSON.parse(user.servers_history || "[]");
        } catch {
            serversHistory = [];
        }

        serversHistory = serversHistory.map(server => {
            if (server.identifier === serverIdentifier) {
                return {
                    ...server,
                    server_active: true
                };
            }

            return server;
        });

        await new Promise((resolve, reject) => {
            db.run(
                "UPDATE users SET servers_history = ? WHERE id = ?",
                [JSON.stringify(serversHistory), user.id],
                function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                }
            );
        });

        return res.json({
            success: true,
            configType,
            server: serverIdentifier,
            email: userEmail,
            permissions,
            server_active: true,
            subuser: data
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

/*_________________________
router.post("/add-subuser", async (req, res) => {
    try {
        console.log("➡️ Request received /add-subuser");
        console.log("📦 Body:", req.body);
        console.log("📨 Headers:", req.headers);

        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                error: "No token provided"
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                error: "Invalid token format"
            });
        }

        let decoded;

        try {
            decoded = jwt.verify(token, "secretkey");
        } catch (err) {
            return res.status(401).json({
                success: false,
                error: "Invalid or expired token"
            });
        }

        const userId = decoded.userId;

        const user = await new Promise((resolve, reject) => {
            db.get(
                "SELECT * FROM users WHERE id = ?",
                [userId],
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                }
            );
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        const userEmail = user.email;

        if (!userEmail) {
            return res.status(400).json({
                success: false,
                error: "User email not found"
            });
        }

        const { serverIdentifier, configType } = req.body;

        if (!serverIdentifier) {
            return res.status(400).json({
                success: false,
                error: "Server identifier is required"
            });
        }

        if (!configType) {
            return res.status(400).json({
                success: false,
                error: "Config type is required"
            });
        }

        const config = VPS_CONFIG[configType];

        if (!config) {
            return res.status(400).json({
                success: false,
                error: "Invalid config type"
            });
        }

        const checkUrl = `${config.url}/api/client/servers/${serverIdentifier}`;

        const check = await fetch(checkUrl, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${config.clientKey}`,
                Accept: "application/json"
            }
        });

        const checkText = await check.text();

        let checkData;

        try {
            checkData = JSON.parse(checkText);
        } catch {
            return res.status(500).json({
                success: false,
                error: "Invalid server response",
                raw: checkText
            });
        }

        if (!check.ok) {
            return res.status(check.status).json({
                success: false,
                error: checkData
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

        const subuserUrl = `${config.url}/api/client/servers/${serverIdentifier}/users`;

        const result = await fetch(subuserUrl, {
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
        });

        const resultText = await result.text();

        let data;

        try {
            data = JSON.parse(resultText);
        } catch {
            return res.status(500).json({
                success: false,
                error: "Invalid subuser response",
                raw: resultText
            });
        }

        if (!result.ok) {
            return res.status(result.status).json({
                success: false,
                error: data
            });
        }

        return res.json({
            success: true,
            configType,
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
_____________________________*/
router.get("/servers", (req, res) => {
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

router.get("/create-servers", (req, res) => {
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

router.get("/:identifier", (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            error: "No token provided"
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            error: "Invalid token format"
        });
    }

    try {
        const decoded = jwt.verify(token, "secretkey");
        const { identifier } = req.params;

        db.get(
            "SELECT * FROM users WHERE id = ?",
            [decoded.userId],
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
                        error: "User not found"
                    });
                }

                let serversHistory = [];

                try {
                    serversHistory = JSON.parse(user.servers_history || "[]");
                } catch {
                    serversHistory = [];
                }

                const server = serversHistory.find(
                    (s) => s.identifier === identifier
                );

                if (!server) {
                    return res.status(404).json({
                        success: false,
                        error: "Server not found"
                    });
                }

                delete user.password;

                res.json({
                    success: true,
                    server
                });
            }
        );
    } catch (err) {
        return res.status(401).json({
            success: false,
            error: "Invalid or expired token"
        });
    }
});
router.post("/free/renew/:identifier", (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            error: "No token provided"
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            error: "Invalid token format"
        });
    }

    try {
        const decoded = jwt.verify(token, "secretkey");
        const { identifier } = req.params;

        db.get(
            "SELECT * FROM users WHERE id = ?",
            [decoded.userId],
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
                        error: "User not found"
                    });
                }

                let free_servers = [];
                try {
                    free_servers = JSON.parse(user.free_servers || "[]");
                } catch {
                    free_servers = [];
                }

                const serverIndex = free_servers.findIndex(s => s.identifier === identifier);

                if (serverIndex === -1) {
                    return res.status(404).json({
                        success: false,
                        error: "Server not found"
                    });
                }

                const server = free_servers[serverIndex];

                const adsBalance = Number(user.ads_balance || 0);

                const cost = 1;

                if (adsBalance < cost) {
                    return res.status(400).json({
                        success: false,
                        error: "Insufficient ads balance"
                    });
                }

                const currentEnd = new Date(server.endDate);
                const newEnd = new Date(currentEnd);
                newEnd.setHours(newEnd.getHours() + 3);

                server.endDate = newEnd.toISOString();

                free_servers[serverIndex] = server;

                const newAdsBalance = adsBalance - cost;

                db.run(
                    "UPDATE users SET free_servers = ?, ads_balance = ? WHERE id = ?",
                    [JSON.stringify(free_servers), newAdsBalance, decoded.userId],
                    function (updateErr) {
                        if (updateErr) {
                            return res.status(500).json({
                                success: false,
                                error: updateErr.message
                            });
                        }

                        return res.json({
                            success: true,
                            server,
                            ads_balance: newAdsBalance
                        });
                    }
                );
            }
        );
    } catch (err) {
        return res.status(401).json({
            success: false,
            error: "Invalid or expired token"
        });
    }
});
router.post("/renew/:identifier", (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            error: "No token provided"
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            error: "Invalid token format"
        });
    }

    try {
        const decoded = jwt.verify(token, "secretkey");
        const { identifier } = req.params;

        db.get(
            "SELECT * FROM users WHERE id = ?",
            [decoded.userId],
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
                        error: "User not found"
                    });
                }

                let servers = [];
                try {
                    servers = JSON.parse(user.servers_history || "[]");
                } catch {
                    servers = [];
                }

                const serverIndex = servers.findIndex(s => s.identifier === identifier);

                if (serverIndex === -1) {
                    return res.status(404).json({
                        success: false,
                        error: "Server not found"
                    });
                }

                const server = servers[serverIndex];
                const price = Number(server.price || 0);
                const months = Number(server.months || 1);
                const balance = Number(user.balance || 0);

                if (balance < price) {
                    return res.status(400).json({
                        success: false,
                        error: "Insufficient balance"
                    });
                }

                const currentEnd = new Date(server.endDate);
                const newEnd = new Date(currentEnd);
                newEnd.setMonth(newEnd.getMonth() + months);

                server.endDate = newEnd.toISOString();

                const newBalance = balance - price;

                servers[serverIndex] = server;

                db.run(
                    "UPDATE users SET servers_history = ?, balance = ? WHERE id = ?",
                    [JSON.stringify(servers), newBalance, decoded.userId],
                    function (updateErr) {
                        if (updateErr) {
                            return res.status(500).json({
                                success: false,
                                error: updateErr.message
                            });
                        }

                        return res.json({
                            success: true,
                            server,
                            balance: newBalance
                        });
                    }
                );
            }
        );
    } catch (err) {
        return res.status(401).json({
            success: false,
            error: "Invalid or expired token"
        });
    }
});
router.get("/free/:identifier", (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            error: "No token provided"
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            error: "Invalid token format"
        });
    }

    try {
        const decoded = jwt.verify(token, "secretkey");
        const { identifier } = req.params;

        db.get(
            "SELECT * FROM users WHERE id = ?",
            [decoded.userId],
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
                        error: "User not found"
                    });
                }

                let freeServers = [];

                try {
                    freeServers = JSON.parse(user.free_servers || "[]");
                } catch {
                    freeServers = [];
                }

                const server = freeServers.find(
                    s => s.identifier === identifier
                );

                if (!server) {
                    return res.status(404).json({
                        success: false,
                        error: "Server not found"
                    });
                }

                return res.json({
                    success: true,
                    server
                });
            }
        );
    } catch (err) {
        return res.status(401).json({
            success: false,
            error: "Invalid or expired token"
        });
    }
});
module.exports = router;
