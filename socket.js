var app = require('./app');
var http = require('http');
let webSocketServer = http.Server(app)
let socketIo = require('socket.io')
let io = socketIo(webSocketServer, { transports: ['websocket'] })

let { formatDate } = require('./core/util/util')

io.on('connection', socket => {
  console.log('连接已经建立', `id:${socket.id}`)

  socket.on('sendMsg', data => {
    socket.broadcast.emit('chatItem', {
      info: data.info,
      nikname: data.nikname,
      time: formatDate()
    })
  })

  socket.on('disconnection', () => {
    socket.disconnect()
    console.log('断开连接', socket.id);
  })
})

webSocketServer.listen(8890, () => {
  console.log('websocket聊天室开启 端口8890')
})

module.exports = webSocketServer