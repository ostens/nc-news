const db = require("../db/connection");

exports.checkArticleExists = (id) => {
  return db
    .query(
      `
        SELECT * FROM articles
        WHERE article_id = $1
        `,
      [id]
    )
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "Article does not exist" });
      }
    });
};
