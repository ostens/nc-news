const { getTopics, postTopics } = require("../controllers/topics");

const topicRouter = require("express").Router();

topicRouter.route("/").get(getTopics).post(postTopics);

module.exports = topicRouter;
