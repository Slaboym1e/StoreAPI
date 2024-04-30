const express = require("express");
const { baseLimits } = require("../helpers/limits.helper");
const { authVerify } = require("../helpers/auth.helper");
const { eventsConroller } = require("../controllers/events.controller");
const { rightsControl, getIdParam } = require("../helper");
const { AchiveController } = require("../controllers/achive.controller");
const app = express.Router();

app.use(baseLimits);
app.get("/", authVerify, async (req, res) => {
  if (!(await rightsControl(req.user.UserId, "events_view")))
    return res.status(403).json({ create: false, msg: "permission denied" });
  const params = req.query;
  return res.json(await eventsConroller.getAll(params.offset, params.limit));
});
app.post("/", authVerify, async (req, res) => {
  if (!(await rightsControl(req.user.UserId, "events_create")))
    return res.status(403).json({ create: false, msg: "permission denied" });
  if (!!!req.body.title)
    return res.status(400).json({ create: false, msg: "bad request" });
  const event = await eventsConroller.add(
    (title = req.body.title),
    req.body.description,
    req.body.start_date,
    req.body.end_date,
    req.user.UserId
  );
  if (!event)
    return res.status(200).json({ create: false, msg: "not unique name" });
  return res.status(201).json(event);
});

app.get("/e-:id", authVerify, async (req, res) => {
  try {
    const id = getIdParam(req);
    if (!(await rightsControl(req.user.UserId, "events_view")))
      return res.status(403).json({ create: false, msg: "permission denied" });
    return res.json(await eventsConroller.getById(id));
  } catch ({ name, message }) {
    console.log(message);
    if (name === "TypeError")
      return res.status(400).json({ msg: "uncorrect id" });
    return res.status(400).json({ msg: "unexpect error" });
  }
});

app.put("/e-:id", authVerify, async (req, res) => {
  try {
    const id = getIdParam(req);
    const data = req.body;
    if (!(await rightsControl(req.user.UserId, "events_edit")))
      return res.status(403).json({ create: false, msg: "permission denied" });
    return res.json({
      update: await eventsConroller.update(
        id,
        data.title,
        data.description,
        data.start_date,
        data.end_date
      ),
    });
  } catch ({ name, message }) {
    console.log(message);
    if (name === "TypeError")
      return res.status(400).json({ msg: "uncorrect id" });
    return res.status(400).json({ msg: "unexpect error" });
  }
});

app.get("/e-:id/achievements", authVerify, async (req, res) => {
  try {
    const id = getIdParam(req);
    if (!(await rightsControl(req.user.UserId, "events_view")))
      return res.status(403).json({ create: false, msg: "permission denied" });
    //const params = req.query;
    return res.json(await AchiveController.getAllByEvent(id));
  } catch ({ name, message }) {
    console.log(message);
    if (name === "TypeError")
      return res.status(400).json({ msg: "uncorrect id" });
    return res.status(400).json({ msg: "unexpect error" });
  }
});

app.get("/search", authVerify, async (req, res) => {
  if (!(await rightsControl(req.user.UserId, "events_view")))
    return res.status(403).json({ create: false, msg: "permission denied" });
  const params = req.query;
  return res.json(await eventsConroller.search(params.q));
});

module.exports = app;
