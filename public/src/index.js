import { Canvas } from './canvas.js'

const socket = io()

socket.on('sendMapData', (data) => {
    let mapData = data.mapData
    let map = data.map
    
    const canvas = new Canvas(mapData, map)
})