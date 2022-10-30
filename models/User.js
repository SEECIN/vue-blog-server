const mongoose = require('mongoose')
const { encrypt, decrypt } = require('../core/util/util')


const schema = new mongoose.Schema({
  username: {
    required: [true, '用户名必填'],
    index: true,
    type: String,
    validate: {
      validator (val) {
        return /^(?!\d+$)(?![a-zA-Z]+$)[a-zA-Z0-9]{4,8}$/.test(val)
      },
      message: "用户名为4-8位(数字+字母)"
    },
    //唯一
    unique: true
  },
  password: {
    type: String,
    //不指定select查询不会返回
    select: false,
    required: [true, '密码必填'],
    validate: {
      validator (val) {
        return val !== '密码格式不正确'
      },
      message: "密码必须为 数字+字母 8-12位"
    },
    set (val) {
      let isValidate = /^(?=.*[a-z])(?=.*\d)[a-zA-Z\d!.#*?&]{8,12}$/.test(decrypt(val))
      if (isValidate) {
        return encrypt(val)
      }
      return '密码格式不正确'
    }
  },
  birthday: {
    type: String,

  },
  email: {
    type: String,
    // required: [true, '邮箱必填'],
    validate: {
      validator: function (val) {
        return /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/.test(val)
      },
      message: "请输入合法邮箱地址"
    },
    unique: true
  },
  avatar: {
    type: String, //URL,
    default: "http://4379499y1y.zicp.vip/images/avatar.jpg"
  },

  nikname: {
    type: String,
    validate: {
      validator: function (val) {
        return /^[0-9a-zA-Z\u0391-\uFFE5]{1,8}$/.test(val)
      },
      message: "昵称可包含 数字/英文/汉字 1-8位"
    },
    default: '用户' + ~~(Math.random() * 99999)
  },

  signature: {
    type: String,
    default: '这个人很懒, 什么都没有留下 (￣o￣) . z Z'
  }
})
module.exports = mongoose.model('User', schema)
// let user = new User({
//   "username": "blog1234",
//   "password": "blog1234",
//   "nikname": "star",
//   "email": "2267826802@qq.com"
// })

// user.save()


// User.create({
//   username: "blog1234",
//   password: "blog1234",
//   nikname: "star",
//   email: "2267826802@qq.com"
// }).then(doc => {
//   console.log(doc);
// }).catch(err => {
//   console.log(err);
// })
