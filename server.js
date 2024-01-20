const express = require('express')
const path = require('path')
const http = require('http')
const PORT = process.env.PORT || 3000
const socketio = require('socket.io')
const app = express()
const server = http.createServer(app)
const io = socketio(server)

// set static folder to public folder 
app.use(express.static(path.join(__dirname, "public")))

// start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))

// listen and handle connection request from web client
io.on('connection', socket => {
    console.log('New WS Connection')
})