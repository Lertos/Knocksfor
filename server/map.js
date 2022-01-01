const fs = require('fs')

const mapFileName = './game_data/map.json'


class Map {

    constructor(rows, cols) {
        this.rows = rows
        this.cols = cols

        this.map = []

        //How far in each direction from the players position should they see
        this.chunkRange = 32

        this.loadMap()
    }

    loadMap() {
        try {
            let rawData = fs.readFileSync(mapFileName)
            let parsed = JSON.parse(rawData)

            this.map = parsed
        } catch (err) {
            //File does not exist
            if (err.code == 'ENOENT')
                this.createMap()
        }
    }

    createMap() {
        mapMetaData.sort(function (a, b) {
            return ((a.occurence > b.occurence) ? -1 : ((a.occurence == b.occurence) ? 0 : 1))
        })

        for (let row = 0; row < this.rows; row++){
            let listRow = []
            
            for (let col = 0; col < this.cols; col++) {
                let tile = this.getRandomTile()
                tile.x = row
                tile.y = col

                listRow.push(tile)
            }
            this.map.push(listRow)
        }

        this.saveMapSync()
    }

    saveMapSync() {
        try {
            fs.writeFileSync(mapFileName, JSON.stringify(this.map))
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

    getMapChunk(rowIndex, colIndex) {
        let chunk = []

        for (let row = rowIndex - this.chunkRange; row <= rowIndex + this.chunkRange; row++){
            let chunkRow = []

            for (let col = colIndex - this.chunkRange; col <= colIndex + this.chunkRange; col++) {
                if (row < 0 || col < 0 || row >= this.map.length || col >= this.map[0].length) {
                    chunkRow.push(this.getWaterTile())
                }
                else {
                    chunkRow.push(this.map[row][col])
                }
            }
            chunk.push(chunkRow)
        }
        return chunk
    }

    getRandomTile() {
        let rand = Math.random()
        let totalChance = 0

        for (let tile = 0; tile < mapMetaData.length; tile++){
            totalChance += mapMetaData[tile].occurence
            
            if (rand <= totalChance) {
                let newTile = { ...mapMetaData[tile] }
                
                if (newTile.ownable)
                    newTile.owner = 'Lertos'
                
                newTile.level = Math.floor(Math.random() * 10) + 1
                
                return newTile
            }    
        }
    }

    getWaterTile() {
        for (let i in mapMetaData) {
            if (mapMetaData[i].id == 'water') {
                return {
                    ...mapMetaData[i]
                }
            }
        }
    }

}

const mapMetaData = [
    {
        id: 'water',
        display: 'Water',
        file: 'water.png',
        ownable: false,
        occurence: 0
    },
    {
        id: 'grass',
        display: 'Grass',
        file: 'grass.png',
        ownable: false,
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