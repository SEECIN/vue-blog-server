const mongoose = require('mongoose')
const { formatDate } = require('../core/util/util')
const schema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  //更新日期
  date: {
    type: mongoose.SchemaTypes.Date,
    default: Date.now,
    get(val) {
      return formatDate(new Date(val), 'yyyy年MM月dd日 hh:mm:ss')
    }
  },
  //评论者 id
  uid: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User"
  },
  //文章 id
  aid: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Article"
  }
})
schema.set('toJSON', { getters: true })
module.exports = mongoose.model('Comment', schema)