const { selectTopics, insertTopic } = require("../models/topics");

exports.getTopics = async (req, res, next) => {
  try {
    const topics = await selectTopics();
    res.status(200).send({ topics });
  } catch (err) {
    next(err);
  }
};

exports.postTopics = async (req, res, next) => {
  try {
    const topic = await insertTopic(req.body);
    res.status(201).send({ topic });
  } catch (err) {
    next(err);
  }
};
