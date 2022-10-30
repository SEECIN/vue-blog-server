module.exports = {
  "Article": [{
    "path": "author",
    "select": "nikname avatar"
  },
  {
    "path": "column",
    "select": "name"
  },
  {
    "path": "comments",
    "select": "content date uid",
    "populate": {
      "path": "uid",
      "select": "nikname avatar"
    }
  }],
  "Comment": [{
    "path": "uid",
    "select": "nikname avatar"
  }],
  "Column": [
    {
      "path": "aids",
      "select": "title cover date hit_num comment_num like_num author"
    }
  ]
}