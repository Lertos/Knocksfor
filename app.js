const express = require('express')
const http = require('http')
const io = require('socket.io')

const app = express()
const server = http.createServer(app)
//const socket = io(server)

app.set('view engine', 'hbs')
app.use(express.static('public'))


app.get('/', (req, res) => {
    res.render('index', {
        title: 'Some Title',
        name: 'Dylan'
    })
})

const PORT = process.env.PORT || 3000

server.listen(PORT, 'localhost', () => {
    console.log('Server is up and running!')
})
