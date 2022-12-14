const db = require("../db/connection");
const { checkExists } = require("../utils/db");

exports.updateCommentById = async (id, votes) => {
  await checkExists("comments", "comment_id", id);
  const result = await db.query(
    `
    UPDATE comments
    SET votes = votes + $2
    WHERE comment_id = $1
    RETURNING *;
          `,
    [id, votes]
  );
  return result.rows[0];
};

exports.removeCommentById = async (id) => {
  await checkExists("comments", "comment_id", id);
  await db.query(
    `
    DELETE FROM comments
    WHERE comment_id = $1;
    `,
    [id]
  );
};
