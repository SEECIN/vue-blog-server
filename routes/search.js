const express = require("express")
const router = express.Router()
const Article = require("../models/Article")


// 根据标题或者内容查找
router.get("/", async (req, res, next) => {
  let { q = "" } = req.query
  let regExp = new RegExp(q, 'i')
  try {
    let result = await Article.find({
      $or: [
        { title: { $regex: regExp } },
        { content: { $regex: regExp } }
      ]
    })
    if (result.length === 0) {
      res.send(422, {
        message: '未查询到相关文章'
      })
      return
    }
    res.send(200, {
      message: '查询成功',
      data: result
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router