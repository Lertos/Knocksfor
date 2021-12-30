const express = require('express')
const http = require('http')
const socketio = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

//TODO - Make a game World script that holds all clients, players, the map, timers, etc
//Then get rid of these and have it all in the World class
const Map = require('./server/map.js')
let gameMap = new Map(5, 4)

let mapData = gameMap.getMapMetaData()
let map = gameMap.getMap()

app.set('view engine', 'hbs')
app.use(express.static('public'))


io.on('connection', (socket) => {
    console.log('New socket connection')

    socket.emit('sendMapData', { mapData: mapData, map: map })
})


app.get('/', (req, res) => {
    res.render('index', {
        title: 'Some Title'
    })
})

const PORT = process.env.PORT || 3000

server.listen(PORT, () => {
    console.log('Server is up and running!')
})
