
const mapData = [
    {
        id: 'grass',
        display: 'Grass',
        file: 'grass.png',
        occurence: 0.87
    },
    {
        id: 'forest',
        display: 'Forest',
        file: 'forest.png',
        occurence: 0.06
    },
    {
        id: 'mountain',
        display: 'Mountain',
        file: 'mountain.png',
        occurence: 0.04
    },
    {
        id: 'swamp',
        display: 'Swamp',
        file: 'swamp.png',
        occurence: 0.02
    },
    {
        id: 'castle',
        display: 'Castle',
        file: 'castle.png',
        occurence: 0.01
    }
]

class Map {

    map = []

    constructor(rows, cols) {
        this.rows = rows
        this.cols = cols

        this.createMap()
    }

    createMap() {
        mapData.sort(function (a, b) {
            return ((a.occurence > b.occurence) ? -1 : ((a.occurence == b.occurence) ? 0 : 1))
        })

        for (let row = 0; row < this.rows; row++){
            let listRow = []

            for (let col = 0; col < this.cols; col++) {
                listRow.push(this.getRandomTile())
            }
            this.map.push(listRow)
        }
    }

    loadMap() {

    }

    getMap() {
        return this.map
    }

    getMapData() {
        return mapData
    }

    getRandomTile() {
        let rand = Math.random()
        let totalChance = 0

        for (let tile = 0; tile < mapData.length; tile++){
            totalChance += mapData[tile].occurence
            
            if (rand <= totalChance) {
                return mapData[tile]
            }    
        }
    }

}


module.exports = Map