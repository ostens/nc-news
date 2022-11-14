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
