const express = require("express");
const helmet = require("helmet");

const app = express();

app.use(express.json());
app.use(helmet());
app.use("/users", require("./routes/user.routes"));
app.use("/roles", require("./routes/roles.routes"));
app.use("/rights", require("./routes/rights.routes"));


module.exports = app;
