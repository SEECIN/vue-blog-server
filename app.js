const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors')
const mongoose = require('./plugins/db')
const assert = require('http-assert')
const User = require('./models/User')
const { maxFileSize } = require("./config")
const expressJwt = require('express-jwt')
const { getPublicKeySync } = require('./core/rsaControl')
//路由
const busRoute = require('./routes/bus');
const adminRoute = require('./routes/admin');
const pubKeyRoute = require("./routes/getPubKey")
const uploadRoute = require("./routes/upload")
const userRoute = require("./routes/user")
const likesRoute = require("./routes/artLikes")
const bodyParser = require("body-parser")

require('./socket')

//中间件  nameMiddleware
const resourceMiddleware = require('./middleware/resource')

const app = express();
app.use(cors({
  "origin": '*', //true 设置为 req.origin.url
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE", //容许跨域的请求方式
  "allowedHeaders": "x-requested-with,Authorization,token, content-type", //跨域请求头
  "preflightContinue": false, // 是否通过next() 传递options请求 给后续中间件 
  "maxAge": 1728000, //options预验结果缓存时间 20天
  "credentials": true, //携带cookie跨域
  "optionsSuccessStatus": 200 //options 请求返回状态码
}))
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));


//鉴权
app.use(expressJwt({
  secret: getPublicKeySync(), //解密秘钥 
  algorithms: ["RS256"], //6.0.0以上版本必须设置解密算法 
  isRevoked: async (req, payload, next) => {
    let { _id } = payload
    req._id = _id
    req.isPass = true
    try {
      let result = await User.findById(_id)
      if (!result) {
        req.isPass = false
      }
      next()
    } catch (err) {
      next(err)
    }
  }
}).unless({
  path: [
    { url: /\/api\/rest/, methods: ['GET'] },
    { url: '/api/rest/keys', methods: ['GET'] },
    { url: '/admin/login' },
    { url: '/admin/register' },
    { url: '/keys' },
    { url: '/search' },
    { url: '/likes' },
  ]
}))


//资源路由
app.use('/api/rest/:resource', resourceMiddleware(), busRoute)

//登陆注册
app.use('/admin/', adminRoute);

//用户信息
app.use('/user', userRoute)

//index
app.use('/index', (req, res, next) => {
  if (req.isPass) {
    res.send(200, {
      message: "ok"
    })
  } else {
    res.send(401, {
      message: "无权限，请先登录"
    })
  }
})

//获取公钥
app.use('/keys', pubKeyRoute);

//文件上传
app.use('/upload', uploadRoute)

//文章点赞
app.use('/likes', likesRoute)


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

const ERROR_MAP = {
  'LIMIT_FILE_SIZE': `文件大小不得超过 ${maxFileSize} bytes`
}
const ERROR_STATUS_MAP = {
  '401': "无权限操作,请先登录"
}
const QUE_MAP = {
  "username": "用户名",
  "email": "邮箱",
  "nikname": "昵称"
}

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};
  if (err.message.indexOf('duplicate key error') !== -1) {
    let repeatKey = Object.entries(err.keyPattern)?.map(([key, value]) => {
      return `${QUE_MAP?.[key]}已存在`
    })[0]
    err.status = 422
    err.message = repeatKey
  }
  if (err.errors) {
    let paramErrors = Object.entries(err.errors).map(([key, val]) => {
      return `${val.message}`
    }).join(',')
    err.status = 422
    err.message = paramErrors
  }
  if (err.code in ERROR_MAP) {
    err.status = 422
    err.message = ERROR_MAP[err.code]
  }
  if (err.status in ERROR_STATUS_MAP) {
    err.message = ERROR_STATUS_MAP[err.status]
  }
  // render the error page
  res.status(err.status || 500).send({
    code: err.status,
    message: err.message
  })
});

module.exports = app;
