const express = require("express");
const app = express.Router();
const { models } = require("../../database/seq");
const {
  isEmail,
  jwtVerify,
  authVerify,
  getIdParam,
  genPasswordHash,
  rightsControl,
} = require("../helper");
const {
  createUser,
  updateUser,
  removeUser,
  getUserById,
} = require("../controllers/user.controller");
const {
  createSession,
  removeSession,
  updateSession,
  removeAllSessions,
} = require("../controllers/session.controller");
const { getRolesByUser, getRoleByName } = require("../controllers/role.controller");
const { getRightsByRoles } = require("../controllers/right.controller");
const { createUserRoleRel } = require("../controllers/userroles.controller");

//сделать отдельную ошибку под заблокированного пользователя
app.post("/signin", async (req, res) => {
  if (!!!req.body.email || !!!req.body.password)
    return res.status(400).json({ signin: false, message: "empty request" });
  if (!isEmail(req.body.email))
    return res
      .status(200)
      .json({ signin: false, msg: "incorrect email address" });
  if (req.body.password.length < 8)
    return res.status(200).json({ signin: false, msg: "incorrect password" });
  try {
    const User = await models.User.findOne({
      where: { email: req.body.email, status: 1 },
    });
    if (!!!User) {
      return res.status(200).json({ signin: false, msg: "user not found" });
    }
    const hash = genPasswordHash(req.body.password, User.salt);
    if (hash !== User.password) {
      return res.status(200).json({ signin: false, msg: "wrong password" });
    }
    const session = await createSession(User, "Agent");
    return res.status(200).json({ signup: true, session: session });
  } catch (err) {
    console.log(`SIGNIN ERROR: ${err}`);
    return res.status(200).json({ signin: false, message: "unexpected" });
  }
});

app.post("/signup", async (req, res) => {
  if (
    !!!req.body.username ||
    !!!req.body.email ||
    !!!req.body.password ||
    !!!req.body.repassword
  )
    return res.status(400).json({ signup: false, message: "empty request" });
  if (!isEmail(req.body.email))
    return res
      .status(200)
      .json({ signup: false, msg: "incorrect email address" });
  if (req.body.password.length < 8 || req.body.password !== req.body.repassword)
    return res.status(200).json({ signup: false, msg: "wrong password" });
  else if (req.body.password.length < 3)
    return res.status(200).json({ signup: false, msg: "wrong username" });
  const User = await createUser(
    req.body.username,
    req.body.email,
    req.body.password
  );
  console.log(User);
  if (!!!User) return res.status(200).json({ signup: false, code: 2 });
  console.log(req);
  //
  const role = getRoleByName("User");
  if(role !== null){
    const rolRel = createUserRoleRel(User.id, role.id);
  }
  //
  const session = await createSession(User, "Agent");
  console.log(session);
  return res.status(201).json({ signup: true, session: session });
});

//запретить переаутентификацю с другого user-agent
app.post("/refresh", async (req, res) => {
  const authHeader = req.headers.rtauthorization;
  if (authHeader == undefined || authHeader == "")
    return res
      .status(401)
      .json({ response: false, message: "Token header not found" });
  let verifyData = jwtVerify(authHeader);
  if (!verifyData.valid)
    return res.status(401).json({ response: false, message: "Bad token" });
  if (!!!verifyData.data.payload.refresh || !verifyData.data.payload.refresh)
    return res
      .status(401)
      .json({ response: false, message: "Incorrect token" });
  console.log(verifyData.data.payload);
  if (
    !!!verifyData.data.payload.sessionId ||
    !!!verifyData.data.payload.sessionRefresh ||
    !!!verifyData.data.payload.userId
  )
    return res.json({ response: false, code: 2 });
  let session = await models.UserSession.findOne({
    where: {
      id: verifyData.data.payload.sessionId,
      last_refresh: verifyData.data.payload.sessionRefresh,
      userId: verifyData.data.payload.userId,
    },
  });
  if (!!!session)
    return res.status(401).json({ response: false, message: "Bad token" });
  const Upd = await updateSession(session.id, session.UserId);
  if (!Upd) return res.json({ response: false, code: 3 });
  return res.json({ response: true, session: Upd });
});

app.post("/logout", authVerify, async (req, res) => {
  return res.json({logout: await removeSession(req.user.id)});
});

app.post("/logoutall", authVerify, async (req, res) => {
  return res.json({logout: await removeAllSessions(req.user.id)});
});

app.get("/u-:id", authVerify, async (req, res) => {
  const id = getIdParam(req);
  const user = await getUserById(id);
  if (user) return res.status(200).json(user);
  return res.status(404).send("404 - Not found");
});

app.get("/u-:id/roles", authVerify, async (req, res) => {
  try {
    const id = getIdParam(req);
    if (
      !(await rightsControl(req.user.UserId, "userroles_view")) &&
      id !== req.user.UserId
    )
      return res.sendStatus(403).json({ msg: "permission denied" });
    return res.json(await getRolesByUser(id));
  } catch ({ name, message }) {
    if (name === "TypeError")
      return res.status(400).json({ msg: "uncorrect id" });
  }
});

app.get("/u-:id/rights", authVerify, async (req, res) => {
  try {
    const id = getIdParam(req);
    if (
      !(await rightsControl(req.user.UserId, "userrights_view")) &&
      req.user.UserId !== id
    )
      return res.sendStatus(403).json({ msg: "permission denied" });
    const userRoles = await getRolesByUser(id);
    if (userRoles === null)
      return res.status(404).json({ msg: "UserRoles not found" });
    let rolesArr = [];
    for (const def of userRoles) {
      rolesArr.push(def.RoleId);
    }
    return res.json(await getRightsByRoles(rolesArr));
  } catch ({ name, message }) {
    if (name === "TypeError")
      return res.status(400).json({ msg: "uncorrect id" });
    return res.status(400).json({ msg: "unexpect error" });
  }
});

app.put("/u-:id", authVerify, async (req, res) => {
  try {
    const id = getIdParam(req);
    const data = req.body;
    if (
      !(await rightsControl(req.user.UserId, "users_edit")) &&
      req.user.UserId !== id
    )
      return res.status(403).json({ msg: "permission denied" });
    return res.json({
      update: await updateUser(id, data.username, data.email, data.avatar),
    });
  } catch ({ name, message }) {
    if (name === "TypeError")
      return res.status(400).json({ msg: "uncorrect id" });
    return res.status(400).json({ msg: "unexpect error" });
  }
});

app.delete("/u-:id", authVerify, async (req, res) => {
  try {
    const id = getIdParam(req);
    if (
      !(await rightsControl(req.user.UserId, "users_remove")) &&
      req.user.UserId !== id
    )
      return res.status(403).json({ msg: "permission denied" });
    return res.json({ remove: await removeUser(id) });
  } catch ({ name, message }) {
    if (name === "TypeError")
      return res.status(400).json({ msg: "uncorrect id" });
    return res.status(400).json({ msg: "unexpect error" });
  }
});

module.exports = app;
