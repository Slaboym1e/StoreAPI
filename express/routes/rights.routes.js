const { getRights } = require("../controllers/right.controller");
const {authVerify} = require ("../helpers/auth.helper");
const { rightsControl } = require("../helper");

const app = require("express").Router();

app.get("/", authVerify, async (req, res) => {
  if (!(await rightsControl(req.user.UserId, "rights_view")))
    return res
      .status(403)
      .json({ create: false, msg: "permission denied" });
  const params = req.query;
  return res.json(await getRights(params.offset, params.limit));
});

module.exports = app;
