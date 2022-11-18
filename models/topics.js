const db = require("../db/connection");

exports.selectTopics = async () => {
  const result = await db.query(`SELECT * FROM topics;`);
  return result.rows;
};

exports.insertTopic = async ({ slug, description }) => {
  const result = await db.query(
    `
  INSERT INTO topics
  (slug, description)
  VALUES
  ($1, $2)
  RETURNING *;
  `,
    [slug, description]
  );
  return result.rows[0];
};
