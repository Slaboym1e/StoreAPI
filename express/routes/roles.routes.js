const express = require("express");
const app = express.Router();
const { authVerify, rightsControl, getIdParam } = require("../helper");
const { createRole, getRoleById, getRoles } = require("../controllers/role.controller");
const { getRightByName } = require("../controllers/right.controller");
const { createRoleRightRelation } = require("../controllers/rolerights.controller");


app.get("/", authVerify, async (req, res) => {
    if (!await rightsControl(req.user.UserId, "role_view"))
        return res.statusCode(403).json({ create: false, msg: "permission denied" });
    const params = req.query;
    return res.json(await getRoles(params.offset, params.limit));
})

app.post("/", authVerify, async (req, res) => {
    if (!await rightsControl(req.user.UserId, "role_create"))
        return res.status(403).json({ create: false, msg: "permission denied" });
    if (!!!req.body.name)
        return res.status(400).json({ create: false, msg: "bad request" });
    const role = await createRole(req.body.name);
    if (!role)
        return res.status(200).json({ create: false, msg: "not unique name" });
    const right = await getRightByName("main_view");
    let rel;
    if (right != null)
        rel = await createRoleRightRelation(role.id, right.id);
    return res.status(201).json({ create: true, role: role, rel: rel });

})

app.get("/r-:id", authVerify, async (req, res) => {
    if (!await rightsControl(req.user.UserId, "role_view"))
        return res.statusCode(403).json({ create: false, msg: "permission denied" });
    try {
        const id = getIdParam(req);
        const role = await getRoleById(id);
        if (role)
            return res.json(role);
        return res.json({ msg: "role not found" });
    } catch (err) {
        return res.json({ msg: "unknown id" });
    }

})

app.put("/r-:id", authVerify, async (req, res) => {
    if (!await rightsControl(req.user.UserId, "role_edit"))
        return res.statusCode(403).json({ create: false, msg: "permission denied" });
    return res.json({ msg: "Ok" });

})

app.delete("/r-:id", authVerify, async (req, res) => {
    if (!await rightsControl(req.user.UserId, "role_delete"))
        return res.statusCode(403).json({ create: false, msg: "permission denied" });
    return res.json({ msg: "Ok" });
})

module.exports = app;