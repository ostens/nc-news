const db = require("../db/connection");
const { checkExists } = require("../utils/db");

exports.selectArticles = async (query) => {
  if (
    !["sort_by", "order", "topic", "limit", "p"].includes(
      ...Object.keys(query)
    ) &&
    Object.keys(query).length !== 0
  ) {
    return Promise.reject({ status: 400, msg: "Invalid query" });
  }
  const {
    topic,
    sort_by = "created_at",
    order = "desc",
    limit = 10,
    p = 1,
  } = query;
  if (!["created_at", "votes", "title", "topic", "author"].includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Invalid sort query" });
  }
  if (!["asc", "desc"].includes(order)) {
    return Promise.reject({ status: 400, msg: "Invalid order query" });
  }
  if (!parseInt(limit)) {
    return Promise.reject({ status: 400, msg: "Invalid limit query" });
  }
  if (!parseInt(p)) {
    return Promise.reject({ status: 400, msg: "Invalid page query" });
  }

  const offset = (parseInt(p) - 1) * parseInt(limit);
  const queryValues = [];
  let queryStr = `
    SELECT articles.article_id, title, topic, articles.author, articles.created_at, articles.votes, 
    COUNT(comment_id)::INT as comment_count,
    COUNT(*) OVER()::INT as total_count
    FROM articles
    LEFT JOIN comments on comments.article_id = articles.article_id
  `;

  if (topic) {
    queryValues.push(topic);
    queryStr += ` WHERE topic = $1`;
  }

  queryStr += `
     GROUP BY articles.article_id
    ORDER BY ${sort_by} ${order}
    LIMIT ${limit} OFFSET ${offset};
    `;

  if (topic) await checkExists("topics", "slug", topic);
  const result = await db.query(queryStr, queryValues);
  const total_count = result.rows.length ? result.rows[0].total_count : 0;
  const articles = result.rows.map((article) => {
    const newArticle = { ...article };
    delete newArticle.total_count;
    return newArticle;
  });
  return { articles, total_count };
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

exports.selectCommentsByArticleId = async (id, limit = 10, p = 1) => {
  await checkExists("articles", "article_id", id);
  if (!parseInt(limit)) {
    return Promise.reject({ status: 400, msg: "Invalid limit query" });
  }
  if (!parseInt(p)) {
    return Promise.reject({ status: 400, msg: "Invalid page query" });
  }
  const offset = (parseInt(p) - 1) * parseInt(limit);
  const result = await db.query(
    `
      SELECT comment_id, votes, created_at, author, body,
      COUNT(*) OVER()::INT as total_count
      FROM comments
      WHERE article_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3;
      `,
    [id, limit, offset]
  );
  const total_count = result.rows.length ? result.rows[0].total_count : 0;
  const comments = result.rows.map((comment) => {
    const newComment = { ...comment };
    delete newComment.total_count;
    return newComment;
  });
  return { comments, total_count };
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
