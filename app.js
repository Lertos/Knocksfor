require('dotenv/config')

const express = require('express')
const http = require('http')
const socketio = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

//TODO - Make a game World script that holds all clients, players, the map, timers, etc
//Then get rid of these and have it all in the World class
const Map = require('./server/map.js')
let gameMap = new Map(256, 256)
//TODO - Need to fetch this from the player object later
let startPosition = {
    x: 64,
    y: 78
}

let mapData = gameMap.getMapMetaData()
let map = gameMap.getMap()

app.set('view engine', 'hbs')
app.use(express.static('public'))


io.on('connection', (socket) => {
    console.log('New socket connection')

    map = gameMap.getMapChunk(startPosition.x, startPosition.y)
    socket.emit('server::setupMap', { mapData: mapData, map: map, x: startPosition.x, y: startPosition.y })

    //TODO - This should be instead grabbed by the players current row/col in their
    //player class - but for now it shall be hardcoded to 0,0
    socket.on('player::getMap', (data) => {
        map = gameMap.getMapChunk(data.x, data.y)
        socket.emit('server::updateMap', { map: map, x: data.x, y: data.y })
    })

})

app.get('/', (req, res) => {
    res.render('index', {
        title: 'Some Title'
    })
})

const PORT = process.env.PORT

server.listen(PORT, () => {
    console.log('Server is up and running on port: ' + PORT)
})
