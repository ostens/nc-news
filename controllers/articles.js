const {
  selectArticles,
  selectArticleById,
  selectCommentsByArticleId,
  insertCommentByArticleId,
} = require("../models/articles");

exports.getArticles = (req, res) => {
  selectArticles().then((articles) => {
    res.status(200).send({ articles });
  });
};

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  selectArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  selectCommentsByArticleId(article_id)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};

exports.postCommentByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const article = req.body;
  insertCommentByArticleId(article_id, article)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};
