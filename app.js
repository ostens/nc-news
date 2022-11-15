const express = require("express");
const {
  getArticles,
  getArticleById,
  getCommentsByArticleId,
  postCommentByArticleId,
} = require("./controllers/articles");
const { getTopics } = require("./controllers/topics");
const {
  psqlErrorHandler,
  customErrorHandler,
  catchAllErrorHandler,
} = require("./errors");

const app = express();
app.use(express.json());

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles/:article_id/comments", getCommentsByArticleId);
app.post("/api/articles/:article_id/comments", postCommentByArticleId);

app.all("/*", (req, res) => {
  res.status(404).send({ msg: "URL not found" });
});

app.use(psqlErrorHandler);
app.use(customErrorHandler);
app.use(catchAllErrorHandler);

module.exports = app;
