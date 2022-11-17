const { getEndpoints } = require("../controllers/endpoints");
const articleRouter = require("./articles-router");
const topicRouter = require("./topics-router");
const userRouter = require("./users-router");

const apiRouter = require("express").Router();

apiRouter.get("/", getEndpoints);
apiRouter.use("/articles", articleRouter);
apiRouter.use("/topics", topicRouter);
apiRouter.use("/users", userRouter);

module.exports = apiRouter;
