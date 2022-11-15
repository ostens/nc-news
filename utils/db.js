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
exports.checkTopicExists = (topic) => {
  return db
    .query(
      `
        SELECT * FROM topics
        WHERE slug = $1
        `,
      [topic]
    )
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "Topic does not exist" });
      }
    });
};
