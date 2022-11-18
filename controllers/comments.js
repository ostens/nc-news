const { updateCommentById, removeCommentById } = require("../models/comments");

exports.patchCommentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { inc_votes } = req.body;
    const comment = await updateCommentById(id, inc_votes);
    res.status(200).send({ comment });
  } catch (err) {
    next(err);
  }
};

exports.deleteCommentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    await removeCommentById(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
