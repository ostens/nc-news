exports.psqlErrorHandler = (err, req, res, next) => {
  if (["22P02", "23502"].includes(err.code)) {
    res.status(400).send({ msg: "Bad request" });
  } else if (err.code === "23503") {
    res.status(404).send({ msg: "Resource does not exist" });
  } else if (err.code === "23505") {
    res.status(400).send({ msg: "Resource already exists" });
  }
  next(err);
};

exports.customErrorHandler = (err, req, res, next) => {
  if (err.msg && err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
};

exports.catchAllErrorHandler = (err, req, res, next) => {
  res.status(500).send({ msg: "Internal server error" });
};
