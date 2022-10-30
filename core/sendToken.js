const { decrypt, encrypt, generateKeys } = require('./util/util')
const fs = require('fs').promises
const fsSync = require('fs')
const { pubKeyPath, priKeyPath } = require('../config')
const { getUserStatusMsg } = require('../core/statusControl')
const { getPrivateKey } = require('../core/rsaControl')
const jwt = require('jsonwebtoken') //token生成包  JWT

module.exports = {
  async sendToken(userInfo) {
    let { username, _id } = userInfo
    let privateKey = await getPrivateKey()
    let token = jwt.sign({ username, _id, exp: ~~((Date.now() / 1000) + 24 * 3600 * 3) }, privateKey, { algorithm: 'RS256' });
    return token
  }
}