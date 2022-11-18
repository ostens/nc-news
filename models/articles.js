const db = require("../db/connection");
const { checkExists } = require("../utils/db");

exports.selectArticles = async (query) => {
  if (
    !["sort_by", "order", "topic"].includes(...Object.keys(query)) &&
    Object.keys(query).length !== 0
  ) {
    return Promise.reject({ status: 400, msg: "Invalid query" });
  }
  const { topic, sort_by = "created_at", order = "desc" } = query;
  if (!["created_at", "votes", "title", "topic", "author"].includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Invalid sort query" });
  }
  if (!["asc", "desc"].includes(order)) {
    return Promise.reject({ status: 400, msg: "Invalid order query" });
  }

  const queryValues = [];
  let queryStr = `
    SELECT articles.article_id, title, topic, articles.author, articles.created_at, articles.votes, 
    COUNT(comment_id)::INT as comment_count 
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

  if (topic) await checkExists("topics", "slug", topic);
  const result = await db.query(queryStr, queryValues);
  return result.rows;
};

exports.insertArticle = async ({ author, title, body, topic }) => {
  const result = await db.query(
    `
      INSERT INTO articles
      (author, title, body, topic)
      VALUES
      ($1, $2, $3, $4)
      RETURNING *;
  `,
    [author, title, body, topic]
  );
  const article = result.rows[0];
  article.comment_count = 0;
  return article;
};

exports.selectArticleById = async (id) => {
  const result = await db.query(
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
  );
  if (!result.rows.length) {
    return Promise.reject({ status: 404, msg: "Resource not found" });
  }
  const article = result.rows[0];
  return article;
};

exports.selectCommentsByArticleId = async (id) => {
  await checkExists("articles", "article_id", id);
  const result = await db.query(
    `
      SELECT comment_id, votes, created_at, author, body FROM comments
      WHERE article_id = $1
      ORDER BY created_at DESC;
      `,
    [id]
  );
  return result.rows;
};

exports.insertCommentByArticleId = async (articleId, article) => {
  await checkExists("articles", "article_id", articleId);
  const result = await db.query(
    `
      INSERT INTO comments
      (author, body, article_id)
      VALUES
      ($1, $2, $3)
      RETURNING *;
    `,
    [article.username, article.body, articleId]
  );
  return result.rows[0];
};

exports.updateArticleById = async (id, votes) => {
  await checkExists("articles", "article_id", id);
  const result = await db.query(
    `
      UPDATE articles
      SET votes = votes + $2
      WHERE article_id = $1
      RETURNING *;
        `,
    [id, votes]
  );
  return result.rows[0];
};

exports.removeArticleById = async (id) => {
  await checkExists("articles", "article_id", id);
  await db.query(
    `
    DELETE FROM articles
    WHERE article_id = $1;
    `,
    [id]
  );
};
