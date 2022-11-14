const express = require("express");
const {
  getArticles,
  getArticleById,
  getCommentsByArticleId,
} = require("./controllers/articles");
const { getTopics } = require("./controllers/topics");
const { psqlErrorHandler, customErrorHandler } = require("./errors");

const app = express();

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.all("/*", (req, res) => {
  res.status(404).send({ msg: "URL not found" });
});

app.use(psqlErrorHandler);
app.use(customErrorHandler);

module.exports = app;
