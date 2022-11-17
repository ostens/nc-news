const {
  getArticles,
  getArticleById,
  getCommentsByArticleId,
  postCommentByArticleId,
  patchArticleById,
  deleteArticleById,
} = require("../controllers/articles");

const articleRouter = require("express").Router();

articleRouter.get("/", getArticles);

articleRouter
  .route("/:id")
  .get(getArticleById)
  .patch(patchArticleById)
  .delete(deleteArticleById);

articleRouter
  .route("/:id/comments")
  .get(getCommentsByArticleId)
  .post(postCommentByArticleId);

module.exports = articleRouter;
