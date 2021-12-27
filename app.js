const express = require('express')
const http = require('http')
const socketio = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.set('view engine', 'hbs')
app.use(express.static('public'))


io.on('connection', () => {
    console.log('New socket connection')
})


app.get('/', (req, res) => {
    res.render('index', {
        title: 'Some Title',
        name: 'Dylan'
    })
})

const PORT = process.env.PORT || 3000

server.listen(PORT, () => {
    console.log('Server is up and running!')
})
