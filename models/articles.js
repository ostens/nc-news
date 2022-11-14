const db = require("../db/connection");

exports.selectArticles = () => {
  return db
    .query(
      `
  SELECT articles.article_id, title, topic, articles.author, articles.created_at, articles.votes, 
  COUNT(comment_id) as comment_count 
  FROM articles
  LEFT JOIN comments on comments.article_id = articles.article_id
  GROUP BY articles.article_id
  ORDER BY created_at DESC;`
    )
    .then(({ rows }) => {
      return rows;
    });
};

exports.selectArticleById = (id) => {
  return db
    .query(
      `SELECT articles.article_id,
      articles.author,
      title,
      body,
      topic,
      created_at,
      votes
      FROM articles
      WHERE article_id = $1`,
      [id]
    )
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "Article does not exist" });
      }
      return rows[0];
    });
};

exports.selectCommentsByArticleId = (id) => {
  return db
    .query(
      `
    SELECT comment_id, votes, created_at, author, body FROM comments
    WHERE article_id = $1
    ORDER BY created_at DESC;
    `,
      [id]
    )
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "No comments found" });
      }
      return rows;
    });
};
