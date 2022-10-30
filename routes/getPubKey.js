const express = require('express')
const router = express.Router()
const { getPublicKey } = require('../core/rsaControl')
const Key = require('../models/Key')

/* GET pubKey */
router.get('/', async function (req, res, next) {
  let pubKey = await Key.findOne().select("content")
  res.send(200, {
    message: 'ok',
    data: {
      pubKey: pubKey.content
    }
  })
})

module.exports = router
