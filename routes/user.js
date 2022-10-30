const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Article = require('../models/Article')
const Column = require('../models/Column')
const assert = require('http-assert')




router.put('/', async (req, res, next) => {
  let putData = req.body
  let isPass = req.isPass //鉴权结果
  let userId = req._id //userID

  try {
    assert(isPass, 400, "无权修改")
    let result = await User.findByIdAndUpdate(userId, putData, { runValidators: true, new: true })
    res.send(200, {
      message: '修改成功'
    })
  } catch (err) {
    console.log(err)
    next(err)
  }
})

//查询资源详情
router.get('/', async (req, res, next) => {
  let _id = req._id
  try {
    let userResult = await User.findById(_id)
    let articleCount = await Article.find({ author: _id }).count()
    let columnCount = await Column.find({ uid: _id }).count()
    userResult = userResult.toJSON()
    userResult.articleCount = articleCount
    userResult.columnCount = columnCount
    res.send(200, {
      message: '查询成功',
      data: userResult
    })
  } catch (err) {
    console.log(err)
    next(err)
  }
})


module.exports = router

