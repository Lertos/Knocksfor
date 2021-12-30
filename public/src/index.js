import { Canvas } from './canvas.js'

const socket = io()
let canvas

socket.on('server::setupMap', (data) => {
    //TODO - change to "data" and let the canvas take them out
    //Will need to also add "player" data, as well as factions, timers, etc
    //TODO - Once the above is done, only send "data" and fix the Canvas class
    canvas = new Canvas(data.mapData, data.map, data.x, data.y)
})

socket.on('server::updateMap', (data) => {
    canvas.currentTile.x = data.x
    canvas.currentTile.y = data.y
    canvas.map = data.map
})

window.addEventListener("keypress", (e) => {
    let key = e.key
    let x = canvas.currentTile.x
    let y = canvas.currentTile.y

    if (key == 'a')
        y--
    else if (key == 'd')
        y++
    else if (key == 'w')
        x--
    else if (key == 's')
        x++
        
    canvas.clearDrawnElements()
    socket.emit('player::getMap', { x: x, y: y })
});