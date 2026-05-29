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

        const servers = [];

        rows.forEach(user => {

            let serversHistory = [];

            try {
                serversHistory = JSON.parse(
                    user.servers_history || "[]"
                );
            }

            catch {
                serversHistory = [];
            }

            if (!Array.isArray(serversHistory)) {
                serversHistory = [];
            }

            serversHistory.forEach(server => {

                servers.push({

                    owner_id: user.id || null,

                    owner_username:
                        user.username || null,

                    owner_email:
                        user.email || null,

                    server_id:
                        server.server_id ||
                        server.id ||
                        null,

                    server_name:
                        server.server_name ||
                        server.name ||
                        null,

                    server_type:
                        server.server_type ||
                        server.type ||
                        null,

                    server_plan:
                        server.server_plan ||
                        server.plan ||
                        null,

                    server_price:
                        server.server_price ||
                        server.price ||
                        null,

                    server_status:
                        server.server_status ||
                        server.status ||
                        null,

                    server_ip:
                        server.server_ip ||
                        server.ip ||
                        null,

                    server_port:
                        server.server_port ||
                        server.port ||
                        null,

                    server_username:
                        server.server_username ||
                        server.username ||
                        null,

                    server_password:
                        server.server_password ||
                        server.password ||
                        null,

                    server_location:
                        server.server_location ||
                        server.location ||
                        null,

                    purchase_date:
                        server.purchase_date ||
                        server.created_at ||
                        null,

                    expire_date:
                        server.expire_date ||
                        server.expires_at ||
                        null,

                    renewal_date:
                        server.renewal_date ||
                        null,

                    created_at:
                        server.created_at ||
                        null,

                    updated_at:
                        server.updated_at ||
                        null,

                    is_active:
                        server.is_active ??
                        null,

                    auto_renew:
                        server.auto_renew ??
                        null,

                    panel_url:
                        server.panel_url ||
                        null,

                    notes:
                        server.notes ||
                        null,

                    raw_data:
                        server
                });
            });
        });

        return res.json({
            success: true,
            total_servers: servers.length,
            servers: servers
        });
    });
});
module.exports = router;