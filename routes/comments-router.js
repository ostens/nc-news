const { patchCommentById } = require("../controllers/comments");

const commentRouter = require("express").Router();

commentRouter.patch("/:id", patchCommentById);

module.exports = commentRouter;
