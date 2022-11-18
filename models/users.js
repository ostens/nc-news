const db = require("../db/connection");
const { checkExists } = require("../utils/db");

exports.selectUsers = async () => {
  const result = await db.query(`SELECT * FROM users;`);
  return result.rows;
};

exports.selectUserByUsername = async (username) => {
  await checkExists("users", "username", username);
  const result = await db.query(
    `
      SELECT * FROM users 
      WHERE username = $1;
      `,
    [username]
  );
  return result.rows[0];
};
