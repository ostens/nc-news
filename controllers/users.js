const { selectUsers, selectUserByUsername } = require("../models/users");

exports.getUsers = async (req, res, next) => {
  try {
    const users = await selectUsers();
    res.status(200).send({ users });
  } catch (err) {
    next(err);
  }
};

exports.getUserByUsername = async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await selectUserByUsername(username);
    res.status(200).send({ user });
  } catch (err) {
    next(err);
  }
};
