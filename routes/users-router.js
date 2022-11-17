const { getUsers, getUserByUsername } = require("../controllers/users");

const userRouter = require("express").Router();

userRouter.get("/", getUsers);

userRouter.get("/:username", getUserByUsername);

module.exports = userRouter;
