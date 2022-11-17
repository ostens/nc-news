const db = require("../db/connection");
const { checkExists } = require("../utils/db");

exports.updateCommentById = (id, votes) => {
  return checkExists("comments", "comment_id", id)
    .then(() => {
      return db.query(
        `
          UPDATE comments
          SET votes = votes + $2
          WHERE comment_id = $1
          RETURNING *;
        `,
        [id, votes]
      );
    })
    .then(({ rows }) => {
      return rows[0];
    });
};
