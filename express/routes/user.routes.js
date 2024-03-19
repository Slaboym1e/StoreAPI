const express = require("express");
const app = express.Router();
const { baseLimits, authLimits } = require("../helpers/limits.helper");
const config = require("../configs/core/app.config");
const {
  jwtVerify,
  getAuthHeader,
  authVerify,
} = require("../helpers/auth.helper");
const {
  isEmail,
  getIdParam,
  genPasswordHash,
  rightsControl,
} = require("../helper");
const { userController } = require("../controllers/user.controller");
const { sessionController } = require("../controllers/session.controller");
const { roleController } = require("../controllers/role.controller");
const { getRightsByRoles } = require("../controllers/right.controller");
const { createUserRoleRel } = require("../controllers/userroles.controller");

app.post("/signin", authLimits, async (req, res) => {
  if (!!!req.body.email || !!!req.body.password)
    return res.status(400).json({ signin: false, message: "empty request" });
  if (!isEmail(req.body.email))
    return res
      .status(401)
      .json({ signin: false, msg: "incorrect email address" });
  if (req.body.password.length < 8)
    return res.status(401).json({ signin: false, msg: "incorrect password" });
  try {
    const user = await userController.getUserByEmail(req.body.email);
    if (user === null) {
      return res.status(401).json({ signin: false, msg: "user not found" });
    } else if (user.status !== 1)
      return res.status(401).json({ signin: false, msg: "User is blocked" });
    if (genPasswordHash(req.body.password, user.salt) !== user.password) {
      return res.status(401).json({ signin: false, msg: "wrong password" });
    }
    const session = await sessionController.add(user, "Agent");
    return res.status(200).json({
      signin: true,
      access_token: session.jwt,
      expires_in: 3600,
      type: "Bearer",
      refresh_token: session.rt,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        status: user.status,
        name: user.name,
        soname: user.soname,
      },
    });
  } catch (err) {
    console.log(`SIGNIN ERROR: ${err}`);
    return res.status(401).json({ signin: false, message: "unexpected" });
  }
});

if (!config.disableSignUp)
  app.post("/signup", authLimits, async (req, res) => {
    if (
      !!!req.body.username ||
      !!!req.body.email ||
      !!!req.body.password ||
      !!!req.body.repassword
    )
      return res.status(400).json({ signup: false, message: "empty request" });
    if (!isEmail(req.body.email))
      return res
        .status(401)
        .json({ signup: false, msg: "incorrect email address" });
    if (
      req.body.password.length < 8 ||
      req.body.password !== req.body.repassword
    )
      return res.status(401).json({ signup: false, msg: "wrong password" });
    else if (req.body.password.length < 3)
      return res.status(401).json({ signup: false, msg: "wrong username" });
    const User = await userController.add(
      req.body.username,
      req.body.email,
      req.body.password
    );
    console.log(User);
    if (!!!User) return res.status(401).json({ signup: false, code: 2 });
    console.log(req);
    //
    const role = roleController.getRoleByName("User");
    if (role !== null) {
      createUserRoleRel(User.id, role.id);
    }
    //
    const session = await sessionController.add(User, "Agent");
    return res.status(201).json({
      signup: true,
      access_token: session.jwt,
      expires_in: 3600,
      type: "Bearer",
      refresh_token: session.rt,
      user: {
        id: User.id,
        username: User.username,
        email: User.email,
        status: User.status,
        name: User.name,
        soname: User.soname,
      },
    });
  });

app.post("/refresh", authLimits, async (req, res) => {
  const authHeader = getAuthHeader(req);
  if (authHeader === null)
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
  if (
    !!!verifyData.data.payload.sessionId ||
    !!!verifyData.data.payload.sessionRefresh ||
    !!!verifyData.data.payload.userId
  )
    return res.status(401).json({ response: false, code: 2 });
  let session = await sessionController.getSessionByUserIdAndRefresh(
    verifyData.data.payload.userId,
    verifyData.data.payload.sessionRefresh
  );
  if (session === null)
    return res.status(401).json({ response: false, message: "Bad token" });
  const Upd = await sessionController.update(session.id, session.UserId);
  if (!Upd) return res.json({ response: false, code: 3 });
  return res.json({
    response: true,
    access_token: Upd.jwt,
    type: "Bearer",
    expires_in: 3600,
    refresh_token: Upd.rt,
  });
});

app.post("/logout", authLimits, authVerify, async (req, res) => {
  return res.json({
    logout: await sessionController.remove(req.user.id),
  });
});

app.post("/logoutall", authLimits, authVerify, async (req, res) => {
  return res.json({
    logout: await sessionController.removeAll(req.user.id),
  });
});

app.get("/u-:id", baseLimits, authVerify, async (req, res) => {
  try {
    const id = getIdParam(req);
    console.log(req.user.UserId);
    if (
      !(await rightsControl(req.user.UserId, "users_view")) &&
      id !== req.user.UserId
    )
      return res.status(403).json({ msg: "perminssion denied" });
    const user = await userController.getById(id);
    if (user !== null) return res.status(200).json(user);
    return res.status(404).json({ msg: "404 - Not found" });
  } catch ({ name, message }) {
    if (name === "TypeError")
      return res.status(400).json({ msg: "uncorrect id" });
    return res.status(400).json({ msg: "unexpect error" });
  }
});

app.get("/u-:id/portfolio", baseLimits, async (req, res) => {
  try {
    const id = getIdParam(req);
    const portfolio = await userController.getPortfolio(id);
    return res.json(portfolio);
  } catch ({ name, message }) {
    console.log(message);
    if (name === "TypeError")
      return res.status(400).json({ msg: "uncorrect id" });
    return res.status(400).json({ msg: "unexpect error" });
  }
});

app.get("/u-:id/achivments", baseLimits, async (req, res) => {
  try {
    const id = getIdParam(req);
    return res.json(await AchiveController.getByUserId(id));
    // const portfolio = await userController.getPortfolio(id);
    // return res.json(portfolio);
    return res.json({ achivments: [] });
  } catch ({ name, message }) {
    console.log(message);
    if (name === "TypeError")
      return res.status(400).json({ msg: "uncorrect id" });
    return res.status(400).json({ msg: "unexpect error" });
  }
});

app.post("/u-:id/changepass", baseLimits, authVerify, async (req, res) => {
  try {
    const id = getIdParam(req);
    if (
      !(await rightsControl(req.user.UserId, "users_edit")) &&
      id !== req.user.UserId
    )
      return res.status(403).json({ msg: "perminssion denied" });
    if (!!!req.body.password)
      return res.status(400).json({ msg: "empty request body" });
    const password = await userController.changePassword(
      req.user.UserId,
      req.body.password
    );
    return res.status(200).json({ update: password });
  } catch ({ name, message }) {
    console.log(message);
    if (name === "TypeError")
      return res.status(400).json({ msg: "uncorrect id" });
    return res.status(400).json({ msg: "unexpect error" });
  }
});

app.get("/u-:id/roles", baseLimits, authVerify, async (req, res) => {
  try {
    const id = getIdParam(req);
    if (
      !(await rightsControl(req.user.UserId, "userroles_view")) &&
      id !== req.user.UserId
    )
      return res.sendStatus(403).json({ msg: "permission denied" });
    return res.json(await roleController.getRolesByUser(id));
  } catch ({ name, message }) {
    if (name === "TypeError")
      return res.status(400).json({ msg: "uncorrect id" });
    return res.status(400).json({ msg: "unexpect error" });
  }
});

app.get("/u-:id/rights", baseLimits, authVerify, async (req, res) => {
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

app.put("/u-:id", baseLimits, authVerify, async (req, res) => {
  try {
    const id = getIdParam(req);
    const data = req.body;
    if (
      !(await rightsControl(req.user.UserId, "users_edit")) &&
      req.user.UserId !== id
    )
      return res.status(403).json({ msg: "permission denied" });
    return res.json({
      update: await userController.edit(
        id,
        data.username,
        data.email,
        data.avatar
      ),
    });
  } catch ({ name, message }) {
    if (name === "TypeError")
      return res.status(400).json({ msg: "uncorrect id" });
    return res.status(400).json({ msg: "unexpect error" });
  }
});

app.delete("/u-:id", baseLimits, authVerify, async (req, res) => {
  try {
    const id = getIdParam(req);
    if (
      !(await rightsControl(req.user.UserId, "users_remove")) &&
      req.user.UserId !== id
    )
      return res.status(403).json({ msg: "permission denied" });
    return res.json({ remove: await userController.remove(id) });
  } catch ({ name, message }) {
    if (name === "TypeError")
      return res.status(400).json({ msg: "uncorrect id" });
    return res.status(400).json({ msg: "unexpect error" });
  }
});

app.post("/add", baseLimits, authVerify, async (req, res) => {
  if (!(await rightsControl(req.user.UserId, "users_create")))
    return res.status(403).json({ msg: "Permission denied" });
  if (
    !!!req.body.username ||
    !!!req.body.email ||
    !!!req.body.password ||
    !!!req.body.repassword
  )
    return res.status(400).json({ signup: false, message: "empty request" });
  if (!isEmail(req.body.email))
    return res
      .status(401)
      .json({ signup: false, msg: "incorrect email address" });
  if (req.body.password.length < 8 || req.body.password !== req.body.repassword)
    return res.status(401).json({ signup: false, msg: "wrong password" });
  else if (req.body.password.length < 3)
    return res.status(401).json({ signup: false, msg: "wrong username" });
  const User = await userController.add(
    req.body.username,
    req.body.email,
    req.body.password
  );
  console.log(User);
  if (!!!User) return res.status(401).json({ signup: false, code: 2 });
  console.log(req);
  //
  const role = await roleController.getRoleByName("User");
  if (role !== null) {
    createUserRoleRel(User.id, role.id);
  }
  return res.status(201).json({ user: User });
});

app.get("/", baseLimits, authVerify, async (req, res) => {
  if (!(await rightsControl(req.user.UserId, "users_view")))
    return res.status(403).json({ msg: "Permission denied" });
  const params = req.query;
  return res.json(await userController.getUsers(params.offset, params.limit));
});

module.exports = app;
