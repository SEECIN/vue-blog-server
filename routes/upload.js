const multer = require("multer")
const path = require("path")
const fs = require("fs")
const express = require('express');
const router = express.Router();
const assert = require('http-assert');
const { uploadPath, uploadURL, maxFileSize } = require('../config')

const FILE_TYPE = {
  'user': 'user',
  'article': 'article'
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let fileType = FILE_TYPE[req.params['classify'].trim()] ?? "other"
    let filePath = path.join(uploadPath, fileType)
    //如果没有文件夹则创建一个
    fs.existsSync(filePath) || fs.mkdirSync(filePath)
    cb(null, filePath)
  },
  filename: function (req, file, cb) {
    const { ext, base, name } = path.parse(file.originalname)
    cb(null, name + '-' + Date.now() + ext)
  }
})

const upload = multer({ storage, limits: { fileSize: maxFileSize } })

router.post('/:classify', upload.any('file'), async (req, res, next) => {
  try {
    let fileType = FILE_TYPE[req.params['classify']] ?? ''
    assert(fileType, 400, '文件上传分类不正确')
    let uid = req._id
    if (fileType === 'user') {
      assert(uid, 422, '用户头像必须指定UID')
    }
    let fileURLS = req.files.map(item => {
      let { destination, filename } = item
      return path.join(uploadURL, path.parse(destination).name, filename).replace(/\\/g, '/').replace('http:/', 'http://')
    })
    let resultData = {
      message: "上传成功",
      data: {
        fileURL: fileURLS[0]
      }
    }
    if (fileType === 'article') {
      let data = fileURLS
      resultData = {
        "errno": 0,
        data
      }
    }
    res.send(200, resultData)
  } catch (err) {
    console.log(err);
    next(err)
  }
})


module.exports = router;