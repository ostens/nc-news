const db = require("../db/connection");
const { checkArticleExists, checkTopicExists } = require("../utils/db");

exports.selectArticles = (topic, sort_by = "created_at", order = "desc") => {
  if (!["created_at", "votes", "title", "topic", "author"].includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Invalid sort query" });
  }
  if (!["asc", "desc"].includes(order)) {
    return Promise.reject({ status: 400, msg: "Invalid order query" });
  }

  const queryValues = [];
  let queryStr = `
    SELECT articles.article_id, title, topic, articles.author, articles.created_at, articles.votes, 
    COUNT(comment_id) as comment_count 
    FROM articles
    LEFT JOIN comments on comments.article_id = articles.article_id
  `;

  if (topic) {
    queryValues.push(topic);
    queryStr += ` WHERE topic = $1`;
  }

  queryStr += `
     GROUP BY articles.article_id
    ORDER BY ${sort_by} ${order};
    `;

  return db.query(queryStr, queryValues).then(({ rows }) => {
    if (!rows.length) {
      return checkTopicExists(topic).then(() => {
        return [];
      });
    }
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
