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

// connection statuses include null, false, true
// null means not connected at all, false means connected but not ready, true means connected and ready
const connections = [null, null]
io.on('connection', socket => {
    // console.log('New web socket connection')

    // find available player number
    let playerIndex = -1;
    for (const i in connections) {
        if (connections[i] == null) {
            playerIndex = i
            break
        }
    }

    // tell connecting client what player num they are
    socket.emit('player-number', playerIndex)

    console.log(`Player ${playerIndex} has connected`)

    // ignore player 3
    if (playerIndex == -1) return

    connections[playerIndex] = false
    
    // tell everyone what player num just connected
    socket.broadcast.emit('player-connection', playerIndex)

     // handle Diconnect
    socket.on('disconnect', () => {
        console.log(`Player ${playerIndex} disconnected`)
        connections[playerIndex] = null
        //broadcast everyone what player number just disconnected
        socket.broadcast.emit('player-connection', playerIndex)
    })

    // On ready
    socket.on('player-ready', () => {
        socket.broadcast.emit('enemy-ready', playerIndex)
        connections[playerIndex] = true
    })

    // check player connections
    socket.on('check-players', () => {
        const players = []
        for (const i in connections) {
            connections[i] == null ? players.push({connected: false, ready: false}) : players.push({connected: true, ready: connections[i]})
        }
        socket.emit('check-players', players)
    })

    // on fire received
    socket.on('fire', id => {
        console.log(`shot fired from ${playerIndex}`, id)

        // emit to other player 
        socket.broadcast.emit('fire', id)

    })

    // on fire reply
    socket.on('fire-reply', square => {
        console.log(square)

        //forward reply to other player
        socket.broadcast.emit('fire-reply', square)

    })

    // timeout connection
    setTimeout(() => {
        connections[playerIndex] = null
        socket.emit('timeout')
        socket.disconnect()
    }, 600000)
})