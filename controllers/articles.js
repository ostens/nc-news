const {
  selectArticles,
  selectArticleById,
  selectCommentsByArticleId,
  insertCommentByArticleId,
  updateArticleById,
  removeArticleById,
  insertArticle,
} = require("../models/articles");

exports.getArticles = async (req, res, next) => {
  try {
    const { articles, total_count } = await selectArticles(req.query);
    res.status(200).send({ articles, total_count });
  } catch (err) {
    next(err);
  }
};

exports.postArticle = async (req, res, next) => {
  try {
    const article = await insertArticle(req.body);
    res.status(201).send({ article });
  } catch (err) {
    next(err);
  }
};

exports.getArticleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const article = await selectArticleById(id);
    res.status(200).send({ article });
  } catch (err) {
    next(err);
  }
};

exports.getCommentsByArticleId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit, p } = req.query;
    const { comments, total_count } = await selectCommentsByArticleId(
      id,
      limit,
      p
    );
    res.status(200).send({ comments, total_count });
  } catch (err) {
    next(err);
  }
};

exports.postCommentByArticleId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const article = req.body;
    const comment = await insertCommentByArticleId(id, article);
    res.status(201).send({ comment });
  } catch (err) {
    next(err);
  }
};

exports.patchArticleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { inc_votes } = req.body;
    const article = await updateArticleById(id, inc_votes);
    res.status(200).send({ article });
  } catch (err) {
    next(err);
  }
};

exports.deleteArticleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    await removeArticleById(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
