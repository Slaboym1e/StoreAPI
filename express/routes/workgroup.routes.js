const express = require("express");
const { baseLimits } = require("../helpers/limits.helper");
const { authVerify } = require("../helpers/auth.helper");
const { WorkGroupController } = require("../controllers/workgroup.controller");
const { rightsControl, getIdParam } = require("../helper");
const { userController } = require("../controllers/user.controller");
const app = express.Router();

app.use(baseLimits);
app.get("/", async (req, res) => {
  const params = req.query;
  return res.json(
    await WorkGroupController.getAll(params.offset, params.limit)
  );
});
app.post("/", authVerify, async (req, res) => {
  if (!(await rightsControl(req.user.UserId, "workgroups_create")))
    return res.status(403).json({ create: false, msg: "permission denied" });
  if (!!!req.body.title)
    return res.status(400).json({ create: false, msg: "bad request" });
  const event = await WorkGroupController.add(req.body.title, req.user.UserId);
  if (!event)
    return res.status(200).json({ create: false, msg: "not unique name" });
  return res.status(201).json(event);
});

app.get("/wg-:id", async (req, res) => {
  try {
    const id = getIdParam(req);
    return res.json(await WorkGroupController.getById(id));
  } catch ({ name, message }) {
    console.log(message);
    if (name === "TypeError")
      return res.status(400).json({ msg: "uncorrect id" });
    return res.status(400).json({ msg: "unexpect error" });
  }
});

app.get("/wg-:id/users", async (req, res) => {
  try {
    const id = getIdParam(req);
    return res.json(await userController.getListByWorkGroupId(id));
  } catch ({ name, message }) {
    console.log(message);
    if (name === "TypeError")
      return res.status(400).json({ msg: "uncorrect id" });
    return res.status(400).json({ msg: "unexpect error" });
  }
});

app.post("/wg-:id/users", authVerify, async (req, res) => {
  try {
    const id = getIdParam(req);
    const data = req.body;
    if (!(await rightsControl(req.user.UserId, "workgroups_edit")))
      return res.status(403).json({ create: false, msg: "permission denied" });
    let create = true;
    console.log(data.create);
    if (data.create !== undefined) create = data.create;
    return res.json({
      update: await WorkGroupController.changeUsers(id, data.userIds, create),
    });
  } catch ({ name, message }) {
    console.log(message);
    if (name === "TypeError")
      return res.status(400).json({ msg: "uncorrect id" });
    return res.status(400).json({ msg: "unexpect error" });
  }
});

app.put("/wg-:id", authVerify, async (req, res) => {
  try {
    const id = getIdParam(req);
    const data = req.body;
    if (!(await rightsControl(req.user.UserId, "workgroups_edit")))
      return res.status(403).json({ create: false, msg: "permission denied" });
    return res.json({
      update: await WorkGroupController.update(id, data.title),
    });
  } catch ({ name, message }) {
    console.log(message);
    if (name === "TypeError")
      return res.status(400).json({ msg: "uncorrect id" });
    return res.status(400).json({ msg: "unexpect error" });
  }
});
app.delete("/wg-:id", baseLimits, authVerify, async (req, res) => {
  try {
    const id = getIdParam(req);
    if (!(await rightsControl(req.user.UserId, "workgroups_remove")))
      return res.status(403).json({ msg: "permission denied" });
    return res.json({ remove: await WorkGroupController.remove(id) });
  } catch ({ name, message }) {
    if (name === "TypeError")
      return res.status(400).json({ msg: "uncorrect id" });
    console.log(message);
    return res.status(400).json({ msg: "unexpect error" });
  }
});

module.exports = app;
