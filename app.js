const express = require("express");
const cors = require("cors");

const {
  psqlErrorHandler,
  customErrorHandler,
  catchAllErrorHandler,
} = require("./errors");
const apiRouter = require("./routes/api-router");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", apiRouter);

app.all("/*", (req, res) => {
  res.status(404).send({ msg: "URL not found" });
});

app.use(psqlErrorHandler);
app.use(customErrorHandler);
app.use(catchAllErrorHandler);

module.exports = app;
