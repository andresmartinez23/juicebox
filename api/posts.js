const express = require("express");
const postsRouter = express.Router();
const { getAllPosts, createPost, updatePost, getPostById } = require("../db");
const { requireUser } = require("./utils");

postsRouter.post("/", requireUser, async (req, res, next) => {
  const { title, content, tags = "" } = req.body;

  const { id } = req.user;
  const tagArr = tags.trim().split(/\s+/);
  const postData = {};

  if (tagArr.length) {
    postData.tags = tagArr;
  }

  try {
    postData.authorId = id;
    postData.title = title;
    postData.content = content;
    postData.tags = tagArr;

    const post = await createPost(postData);

    res.send({ post });
    // if (post) {
    //   res.send({ post });
    // } else {
    //   next();
    // }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// curl http://localhost:3000/api/posts -X POST -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJKb3NodWEiLCJpYXQiOjE1OTAxMDk0MjR9.qIxDbnOELk-nMPL0ctGoP1Gl6d_YEdOBrd-N3XMNw8c' -H 'Content-Type: application/json' -d '{"title": "test post", "content": "how is this?", "tags": " #once #twice    #happy"}'
// curl http://localhost:3000/api/posts/1 -X PATCH -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJKb3NodWEiLCJpYXQiOjE1OTAyNDAxMjJ9.38y9BJfSygNdboAguBKscRoW7EnDghLl32031rIc8C4' -H 'Content-Type: application/json' -d '{"title": "updating my old stuff", "tags": "#oldisnewagain"}'

postsRouter.use((req, res, next) => {
  next();
});

postsRouter.get("/", async (req, res) => {
  try {
    const allPosts = await getAllPosts();

    const posts = allPosts.filter((post) => {
      return post.active || (req.user && post.author.id === req.user.id);
    });
    res.send({
      posts,
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.patch("/:postId", requireUser, async (req, res, next) => {
  const { postId } = req.params;
  const { title, content, tags } = req.body;

  const updateFields = {};

  if (tags && tags.length > 0) {
    updateFields.tags = tags.trim().split(/\s+/);
  }

  if (title) {
    updateFields.connect = content;
  }

  try {
    const originalPost = await getPostById(postId);

    if (originalPost.author.id === req.user.id) {
      const updatedPost = await updatePost(postId, updateFields);
      res.send({ post: updatedPost });
    } else {
      next({
        name: "Unauthorized_User_Error",
        message: "You cannot update a post that is not yours",
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.delete("/:postId", requireUser, async (req, res, next) => {
  try {
    const post = await getPostById(req.params.postId);

    if (post && post.author.id === req.user.id) {
      const updatedPost = await updatePost(post.id, { active: false });

      res.send({ post: updatedPost });
    } else {
      next(
        post
          ? {
              name: "Unauthorized_User_Error",
              message: " You cannot delete a post which is not yours",
            }
          : {
              name: "Post_Not_Found_Error",
              message: "That post does not exist",
            }
      );
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// curl http://localhost:3000/api/posts -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJKb3NodWEiLCJpYXQiOjE1OTAyNDAxMjJ9.38y9BJfSygNdboAguBKscRoW7EnDghLl32031rIc8C4'

module.exports = postsRouter;
