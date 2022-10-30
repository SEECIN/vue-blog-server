var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', expressJwt({
  secret: getPublicKeySync(), //解密秘钥 
  algorithms: ["RS256"], //6.0.0以上版本必须设置解密算法 
  isRevoked: function (req, payload, next) {
    let { username, _id } = payload
    req.username = username
    req.userID = _id

    userControl.verifyToken(username, _id).then(result => {
      req.isPass = false
      if (result.statusCode === getUserStatusMsg('USER_FOND')['statusCode']) {
        req.isPass = true
      }
      next()
    })

  }
}), async function (req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
