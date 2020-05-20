const express = require("express");
const postsRouter = express.Router();
const { getAllPosts } = require("../db");

postsRouter.use((req, res, next) => {
  next();
});

postsRouter.get("/", async (req, res) => {
  const posts = await getAllPosts();

  res.send({
    posts,
  });
});

module.exports = postsRouter;
