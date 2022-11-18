const {
  patchCommentById,
  deleteCommentById,
} = require("../controllers/comments");

const commentRouter = require("express").Router();

commentRouter.route("/:id").patch(patchCommentById).delete(deleteCommentById);

module.exports = commentRouter;
