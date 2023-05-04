const express = require("express");
const helmet = require("helmet");

const app = express();

app.use(express.json());
app.use(helmet());
app.use("/users", require("./routes/user.routes"));


module.exports = app;