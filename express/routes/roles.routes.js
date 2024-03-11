const express = require("express");
const app = express.Router();
const { authVerify } = require("../helpers/auth.helper");
const { rightsControl, getIdParam } = require("../helper");
const { baseLimits } = require("../helpers/limits.helper");
const { roleController } = require("../controllers/role.controller");
const {
  getRightByName,
  getRightsByRoles,
} = require("../controllers/right.controller");
const {
  createRoleRightRelation,
  addRightsToRole,
  removeRightsFromRole,
} = require("../controllers/rolerights.controller");
const {
  createUserRoleRel,
  deleteUserRolRel,
} = require("../controllers/userroles.controller");

app.use(baseLimits);
app.use(authVerify);

app.get("/", async (req, res) => {
  if (!(await rightsControl(req.user.UserId, "roles_view")))
    return res.status(403).json({ create: false, msg: "permission denied" });
  const params = req.query;
  return res.json(await roleController.getRoles(params.offset, params.limit));
});

app.post("/", async (req, res) => {
  if (!(await rightsControl(req.user.UserId, "roles_create")))
    return res.status(403).json({ create: false, msg: "permission denied" });
  if (!!!req.body.name)
    return res.status(400).json({ create: false, msg: "bad request" });
  const role = await roleController.createRole(req.body.name);
  if (!role)
    return res.status(200).json({ create: false, msg: "not unique name" });
  const right = await getRightByName("main_view");
  let rel;
  if (right != null) rel = await createRoleRightRelation(role.id, right.id);
  return res.status(201).json({ create: true, role: role, rel: rel });
});

app.get("/r-:id", async (req, res) => {
  if (!(await rightsControl(req.user.UserId, "roles_view")))
    return res.status(403).json({ create: false, msg: "permission denied" });
  try {
    const id = getIdParam(req);
    const role = await roleController.getRoleById(id);
    if (role) return res.json(role);
    return res.json({ msg: "role not found" });
  } catch (err) {
    return res.json({ msg: "unknown id" });
  }
});

app.get("/r-:id/rights", async (req, res) => {
  if (!(await rightsControl(req.user.UserId, "rolerights_view")))
    return res.status(403).json({ msg: "Permission denied" });
  try {
    const id = getIdParam(req);
    return res.json(await roleController.getRightsByRoles(id));
  } catch ({ name, message }) {
    if (name === "TypeError")
      return res.status(400).json({ msg: "uncorrect id" });
    return res.status(400).json({ msg: "unexpect error" });
  }
});

app.post("/r-:id/rights", async (req, res) => {
  if (!(await rightsControl(req.user.UserId, "rolerights_edit")))
    return res.status(403).json({ msg: "Permission denied" });
  try {
    const id = getIdParam(req);
    if (!!req.body.rights) return res.status(400).json({ msg: "Bad request" });
    return res.json(await roleController.addRightsToRole(id, req.body.rights));
  } catch ({ name, message }) {
    if (name === "TypeError")
      return res.status(400).json({ msg: "uncorrect id" });
    return res.status(400).json({ msg: "unexpect error" });
  }
});

app.delete("/r-:id/rights", async (req, res) => {
  if (!(await rightsControl(req.user.UserId, "rolerights_edit")))
    return res.status(403).json({ msg: "Permission denied" });
  try {
    const id = getIdParam(req);
    if (!!req.body.rights) return res.status(400).json({ msg: "Bad request" });
    return res.json(
      await roleController.removeRightsFromRole(id, req.body.rights)
    );
  } catch ({ name, message }) {
    if (name === "TypeError")
      return res.status(400).json({ msg: "uncorrect id" });
    return res.status(400).json({ msg: "unexpect error" });
  }
});

//Добавить пагинацию
app.get("/r-:id/users", async (req, res) => {
  if (!(await rightsControl(req.user.UserId, "userroles_view")))
    return res.status(403).json({ msg: "Permission denied" });
  try {
    const id = getIdParam(req);
    return res.json(await roleController.getUsersByRoles(id));
  } catch ({ name, message }) {
    if (name === "TypeError")
      return res.status(400).json({ msg: "uncorrect id" });
    return res.status(400).json({ msg: "unexpect error" });
  }
});

app.post("/r-:id/users", async (req, res) => {
  if (!(await rightsControl(req.user.UserId, "userroles_edit")))
    return res.status(403).json({ msg: "Permission denied" });
  try {
    const id = getIdParam(req);
    if (!!!req.body.user || Array.isArray(req.body.userId))
      return res.status(400).json({ msg: "Bad request" });
    return res.json(await createUserRoleRel(req.body.userId, id));
  } catch ({ name, message }) {
    if (name === "TypeError")
      return res.status(400).json({ msg: "uncorrect id" });
    return res.status(400).json({ msg: "unexpect error" });
  }
});

app.delete("/r-:id/users", async (req, res) => {
  if (!(await rightsControl(req.user.UserId, "userroles_edit")))
    return res.status(403).json({ msg: "Permission denied" });
  try {
    const id = getIdParam(req);
    if (!!!req.body.user || Array.isArray(req.body.userId))
      return res.status(400).json({ msg: "Bad request" });
    return res.json({ delete: await deleteUserRolRel(req.body.userId, id) });
  } catch ({ name, message }) {
    if (name === "TypeError")
      return res.status(400).json({ msg: "uncorrect id" });
    return res.status(400).json({ msg: "unexpect error" });
  }
});

app.put("/r-:id", async (req, res) => {
  try {
    const id = getIdParam(req);
    if (!(await rightsControl(req.user.UserId, "role_edit")))
      return res.status(403).json({ create: false, msg: "permission denied" });
    return res.json(await roleController.editRole(id, req.body.name));
  } catch ({ name, message }) {
    if (name === "TypeError")
      return res.status(400).json({ msg: "uncorrect id" });
    return res.status(400).json({ msg: "unexpect error" });
  }
});

app.delete("/r-:id", async (req, res) => {
  if (!(await rightsControl(req.user.UserId, "role_delete")))
    return res.status(403).json({ create: false, msg: "permission denied" });
  return res.json({ msg: "Ok" });
});

module.exports = app;
