const { updateCommentById } = require("../models/comments");

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
