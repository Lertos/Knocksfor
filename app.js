const express = require('express')
const http = require('http')
const socketio = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const Map = require('./server/map.js')
let gameMap = new Map(32, 32)

let mapData = gameMap.getMapData()
let map = gameMap.getMap()

//console.log(mapData)

app.set('view engine', 'hbs')
app.use(express.static('public'))


//TESTING
//TESTING
//TESTING
let test = {
    txt: 'heyu',
    fun: () => {
        testingFun()
    }
    
}

let testingFun = () => {
    console.log('heyu2')
}

console.log(test.txt)
test.fun()
//TESTING
//TESTING
//TESTING




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
