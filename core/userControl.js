const { generateKeys, encrypt, decrypt } = require('./util/util')
const fs = require('fs').promises
const { userPath } = require('../config')
const { getUserStatusMsg } = require('./statusControl')

module.exports = {
  async addUser(username, pwd) {
    let password = encrypt(pwd)
    let user = await this.getUserInfo(username)
    if (user?.['tag'] === "USER_NOTFOUND") {
      let userId = await getUsersNum()
      userId = ('000000' + userId).substr(-6)
      await appendUser({ user_id: userId, user_name: username, password })
      return {
        ...getUserStatusMsg("USER_ADD")
      }
    }
    if (user?.['tag'] === "USER_FOUND") {
      return {
        ...getUserStatusMsg("USER_EXIST")
      }
    }
    return {
      statusCode: user.statusCode,
      errMsg: '注册失败'
    }
  },
  async getUserInfo(username) {
    try {
      let user = await getUsers()
      let userInfo = user.find(item => item['user_name'].trim() === username.trim())
      if (!userInfo) {
        return {
          ...getUserStatusMsg("USER_NOTFOUND")
        }
      }
      return {
        ...getUserStatusMsg("USER_FOUND"),
        data: {
          ...userInfo
        }
      }
    } catch (error) {
      console.error(error)
      return {
        ...getUserStatusMsg("USER_ERROR")
      }
    }
  },
  async verifyToken(username, userID) {
    try {
      let user = await getUsers()
      let userInfo = user.find(item => item['user_id'].trim() === userID.trim())
      if (!userInfo) {
        return {
          ...getUserStatusMsg("USER_NOTFOUND")
        }
      }
      if (userInfo['user_name'] === username) {
        return {
          ...getUserStatusMsg("USER_FOUND"),
        }
      }
    } catch (error) {
      console.error(error)
      return {
        ...getUserStatusMsg("USER_ERROR")
      }
    }

  },
  async verifyUser(username, pwd) {
    let user = await this.getUserInfo(username)
    if (user?.['tag'] !== "USER_FOUND") {
      return user
    }
    let { user_id, user_name, password } = user.data
    let isVerify = decrypt(decrypt(password.trim())) === decrypt(pwd.trim())
    if (isVerify) {
      return {
        ...getUserStatusMsg("USER_VERIFY"),
        data: {
          user_id, user_name
        }
      }
    }
  }
}

async function getUsers() {
  let users = await fs.readFile(userPath, 'utf8')
  users = JSON.parse(users)
  return users
}

async function setUsers(users) {
  try {
    fs.writeFile(userPath, JSON.stringify(users), 'utf8')
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

async function appendUser({ user_id = false, user_name = false, password = false }) {
  let user = await getUsers()
  user.push({
    user_id, user_name, password
  })
  await setUsers(user)
  return true
}

async function getUsersNum() {
  let users = await getUsers()
  return users?.length
}