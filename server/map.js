const fs = require('fs')

const mapFileName = './game_data/map.json'


class Map {

    //TODO - Might want to either change this so rows and cols aren't passed
    ///and instead are variables above - or leave it and only generate a new map
    //when there is no data in the save file
    constructor(rows, cols) {
        this.rows = rows
        this.cols = cols

        this.map = []

        //How far in each direction from the players position should they see
        this.chunkRange = 32

        this.createMap()
    }

    createMap() {
        mapMetaData.sort(function (a, b) {
            return ((a.occurence > b.occurence) ? -1 : ((a.occurence == b.occurence) ? 0 : 1))
        })

        let xCoord = -(this.rows - Math.floor(this.rows / 2))
        
        for (let row = 0; row < this.rows; row++){
            let listRow = []
            let yCoord = -(this.cols - Math.floor(this.cols / 2))
            
            for (let col = 0; col < this.cols; col++) {
                let tile = this.getRandomTile()
                tile.x = xCoord
                tile.y = yCoord

                yCoord++
                listRow.push(tile)
            }
            xCoord++
            this.map.push(listRow)
        }

        //this.saveMap()
        //this.loadMap()
    }

    saveMap() {
        try {
            fs.writeFileSync(mapFileName, JSON.stringify(this.map))
        } catch (err) {
            console.error(err)
        }
    }

    loadMap() {
        try {
            let rawData = fs.readFileSync(mapFileName)
            let parsed = JSON.parse(rawData)

            this.map = parsed
        } catch (err) {
            console.error(err)
        }
    }

    getMap() {
        return this.map
    }

    getMapMetaData() {
        return mapMetaData
    }

    //TODO - Need to check for edge cases so they dont go out of bounds. Simply return -1 and handle it in the server side
    getMapChunk(rowIndex, colIndex) {
        let chunk = []
        
        for (let row = rowIndex - this.chunkRange; row <= rowIndex + this.chunkRange; row++){
            let chunkRow = []

            for (let col = colIndex - this.chunkRange; col <= colIndex + this.chunkRange; col++) {
                chunkRow.push(this.map[row][col])
            }
            chunk.push(chunkRow)
        }
        return chunk
    }

    //TODO - Add ownership, random start level, growth speed double
    getRandomTile() {
        let rand = Math.random()
        let totalChance = 0

        for (let tile = 0; tile < mapMetaData.length; tile++){
            totalChance += mapMetaData[tile].occurence
            
            if (rand <= totalChance) {
                return {
                    ...mapMetaData[tile]
                }
            }    
        }
    }

}

const mapMetaData = [
    {
        id: 'grass',
        display: 'Grass',
        file: 'grass.png',
        ownable: true,
        occurence: 0.87
    },
    {
        id: 'forest',
        display: 'Forest',
        file: 'forest.png',
        ownable: true,
        occurence: 0.06
    },
    {
        id: 'mountain',
        display: 'Mountain',
        file: 'mountain.png',
        ownable: true,
        occurence: 0.04
    },
    {
        id: 'swamp',
        display: 'Swamp',
        file: 'swamp.png',
        ownable: true,
        occurence: 0.02
    },
    {
        id: 'castle',
        display: 'Castle',
        file: 'castle.png',
        ownable: true,
        occurence: 0.01
    }
]

module.exports = Map