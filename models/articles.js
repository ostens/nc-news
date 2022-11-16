const db = require("../db/connection");
const { checkArticleExists } = require("../utils/db");

exports.selectArticles = () => {
  return db
    .query(
      `
  SELECT articles.article_id, title, topic, articles.author, articles.created_at, articles.votes, 
  COUNT(comment_id)::INT as comment_count 
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
      articles.body,
      topic,
      articles.created_at,
      articles.votes,
      COUNT(comment_id)::INT as comment_count 
      FROM articles
      LEFT JOIN comments on comments.article_id = articles.article_id
      WHERE articles.article_id = $1
      GROUP BY articles.article_id`,
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
  return checkArticleExists(id)
    .then(() => {
      return db.query(
        `
        SELECT comment_id, votes, created_at, author, body FROM comments
        WHERE article_id = $1
        ORDER BY created_at DESC;
      `,
        [id]
      );
    })
    .then(({ rows }) => {
      return rows;
    });
};

exports.insertCommentByArticleId = (articleId, article) => {
  return checkArticleExists(articleId)
    .then(() => {
      return db.query(
        `
        INSERT INTO comments
        (author, body, article_id)
        VALUES
        ($1, $2, $3)
        RETURNING *;
    `,
        [article.username, article.body, articleId]
      );
    })
    .then(({ rows }) => rows[0]);
};

exports.updateArticleById = (id, votes) => {
  return checkArticleExists(id)
    .then(() => {
      return db.query(
        `
          UPDATE articles
          SET votes = votes + $2
          WHERE article_id = $1
          RETURNING *;
        `,
        [id, votes]
      );
    })
    .then(({ rows }) => {
      return rows[0];
    });
};
