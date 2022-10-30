const { generateKeys, encrypt, decrypt } = require('./util/util')
const fs = require('fs').promises
const fsSync = require('fs')
const { pubKeyPath, priKeyPath } = require('../config')

module.exports = {
  getPublicKeySync() {
    return fsSync.readFileSync(pubKeyPath, 'utf8')
  },
  async getPublicKey() {
    let key
    try {
      key = await fs.readFile(pubKeyPath, 'utf8')
    } catch (error) {
      generateKeys()
      key = await fs.readFile(pubKeyPath, 'utf8')
    }
    return key
  },
  async getPrivateKey() {
    let key
    try {
      key = await fs.readFile(priKeyPath, 'utf8')
    } catch (error) {
      generateKeys()
      key = await fs.readFile(priKeyPath, 'utf8')
    }
    return key
  }
}
