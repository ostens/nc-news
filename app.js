const express = require("express");
const {
  getArticles,
  getArticleById,
  getCommentsByArticleId,
  postCommentByArticleId,
  patchArticleById,
  deleteArticleById,
} = require("./controllers/articles");
const { getEndpoints } = require("./controllers/endpoints");
const { getTopics } = require("./controllers/topics");
const { getUsers } = require("./controllers/users");
const {
  psqlErrorHandler,
  customErrorHandler,
  catchAllErrorHandler,
} = require("./errors");

const app = express();
app.use(express.json());

app.get("/api", getEndpoints);

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles/:article_id/comments", getCommentsByArticleId);
app.post("/api/articles/:article_id/comments", postCommentByArticleId);
app.patch("/api/articles/:article_id", patchArticleById);
app.delete("/api/articles/:article_id", deleteArticleById);

app.get("/api/users", getUsers);

app.all("/*", (req, res) => {
  res.status(404).send({ msg: "URL not found" });
});

app.use(psqlErrorHandler);
app.use(customErrorHandler);
app.use(catchAllErrorHandler);

module.exports = app;
