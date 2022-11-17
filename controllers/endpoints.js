const { selectEndpoints } = require("../models/endpoints");

exports.getEndpoints = (req, res) => {
  const endpoints = selectEndpoints();
  res.status(200).send({ endpoints });
};
