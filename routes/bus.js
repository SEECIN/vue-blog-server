
const QS = require('qs')
const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Article = require('../models/Article')
const Column = require('../models/Column')
const Comment = require('../models/Comment')
const createError = require('http-errors')
const assert = require('http-assert')
const app = require('../app')
const { pagination } = require("../core/util/util")

const POPULATE_MAP = require("../plugins/POPULATE_MAP")
const COLLECTION_MAP = require("../plugins/COLLECTION_MAP")
const ART_HIT_MAP = require("../plugins/ART_HIT_MAP")
const RESOURCE_PUT_MAP = require("../plugins/RESOURCE_PUT_MAP")
const RESOURCE_POST_MAP = require("../plugins/RESOURCE_POST_MAP")
//创建
router.post('/', async (req, res, next) => {
  try {
    let modelName = req.Model.modelName
    let body = req.body
    if (modelName in RESOURCE_POST_MAP) {
      body = RESOURCE_POST_MAP[modelName]['body'](body, req._id)
    }
    const result = await req.Model.create(body)
    if (modelName in COLLECTION_MAP) {
      let item = COLLECTION_MAP[modelName]
      let { _refId, _model, queryAct, options } = item
      let _id = result._id
      let refId = result?.[_refId]
      assert(refId, 422, `${refId} 为必填项`)
      await _model[queryAct](refId, options(_id))
    }
    res.send(200, {
      message: '提交成功',
      data: {
        id: result._id
      }
    })
  } catch (err) {
    next(err || createError(400, '添加失败'))
  }
})

//更新
router.put('/:id', async (req, res) => {
  let putData = req.body
  let modelName = req.Model.modelName
  //修改的资源id
  let id = req.params.id
  //鉴权结果
  let isPass = req.isPass
  //userid
  let userId = req._id

  try {
    let { revisable, authField } = RESOURCE_PUT_MAP[modelName]
    //验证权限
    let isValidate = (modelName in RESOURCE_PUT_MAP) && isPass
    assert(isValidate, 400, "无权修改")
    let data = await req.Model.findById(id)
    assert(data, 404, "资源不存在")
    assert.equal(userId, data?.[authField], 400, '无权修改')

    let updateData = Object.entries(putData).filter(([key, value]) => {
      return revisable.includes(key)
    })

    isValidate = updateData.length !== 0
    assert(isValidate, 400, '修改失败')
    updateData = Object.fromEntries(updateData)
    updateData['date'] = new Date().toISOString()
    await req.Model.findByIdAndUpdate(id, updateData)
    res.send(200, {
      message: '修改成功'
    })
  } catch (err) {
    next(err)
  }
})

//删除
router.delete('/:id', async (req, res) => {
  await req.Model.findByIdAndDelete(req.params.id)
  res.send({
    errMsg: 'ok'
  })
})

//查询资源列表
router.get('/', async (req, res, next) => {
  let modelName = req.Model.modelName
  let { options = {}, page = 1, size = 100, query = {}, dis = 8, populate = {} } = req.query
  if(query){
    query = QS.parse(query)
  }
  
  if (query.q) {
    let regexp = new RegExp(query.q, 'i')
    query = {
      $or: [
        { title: { $regex: regexp } },
        { content: { $regex: regexp } }
      ]
    }
  }

  try {
    if (modelName in POPULATE_MAP) {
      populate = POPULATE_MAP[modelName]
    }
    let result = await pagination({ model: req.Model, query, options, populate, size, page, dis })
    res.send(200, {
      message: "ok",
      data: result
    })
  } catch (err) {
    console.log(err)
    next(createError(422, "获取失败"))
  }
})

//查询资源详情
router.get('/:id', async (req, res) => {
  let modelName = req.Model.modelName
  let id = req.params.id
  try {
    let querys = req.Model.findById(id)
    if (modelName in POPULATE_MAP) {
      let populates = POPULATE_MAP[modelName]
      let result = await querys.populate(populates).exec()
      res.send(200, {
        message: '查询成功',
        data: result
      })
    }

    if (modelName in ART_HIT_MAP) {
      let { queryAct, options } = ART_HIT_MAP[modelName]
      await req.Model[queryAct](id, options())
    }
  } catch (error) {
    console.log(error)
  }
})

/*
多级填充
User.
  findOne({ name: 'Val' }).
  populate({
    path: 'friends',
    // Get friends of friends - populate the 'friends' array for every friend
    populate: { path: 'friends' }
  })
 */


module.exports = router