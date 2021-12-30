import { Canvas } from './canvas.js'

const socket = io()

socket.on('sendMapData', (data) => {
    //TODO - change to "data" and let the canvas take them out
    //Will need to also add "player" data, as well as factions, timers, etc
    let mapData = data.mapData
    let map = data.map
    
    //TODO - Once the above is done, only send "data" and fix the Canvas class
    const canvas = new Canvas(mapData, map)
})