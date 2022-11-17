const { updateCommentById } = require("../models/comments");

exports.patchCommentById = (req, res, next) => {
  const { id } = req.params;
  const { inc_votes } = req.body;
  updateCommentById(id, inc_votes)
    .then((comment) => {
      res.status(200).send({ comment });
    })
    .catch(next);
};
