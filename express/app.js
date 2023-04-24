const express = require("express");

const app = express();

app.use(express.json());
app.use("/users", require("./routes/user.routes"));


module.exports = app;