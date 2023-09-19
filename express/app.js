const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use("/users", require("./routes/user.routes"));
app.use("/roles", require("./routes/roles.routes"));
app.use("/rights", require("./routes/rights.routes"));


module.exports = app;
