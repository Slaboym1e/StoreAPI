const express = require("express");
const { baseLimits } = require("../helpers/limits.helper");
const { authVerify } = require("../helpers/auth.helper");
const { eventsConroller } = require("../controllers/events.controller");
const { rightsControl } = require("../helper");
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

module.exports = app;
