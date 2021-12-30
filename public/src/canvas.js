
const Color = {
    white: '#ffffff',
    red: '#d60000',
    blue: '#4275cf',
    darkBrown: '#383131',
    lightBrown: '#4a4343',
}

const State = {
    map: 'map',
    city: 'city',
    popup: 'popup'
}

const FontSizes = {
    header: 24,
    title: 20,
    normal: 16
}

let currentState = State.map
let tileSize = 32
let borderWidth = 4


export class Canvas {

    images = []
    elementsToDraw = []
    textToDraw = []
    
    constructor(mapData, map) {
        this.mapData = mapData
        this.map = map
        
        this.createCanvas()
        this.canvas.addEventListener('mousedown', (e) => { this.getCursorPosition(e) })

        window.onresize = () => { this.resize() }

        this.loadImages()
        this.draw()
    }

    createCanvas() {
        let canvas = document.createElement('canvas')
        document.body.appendChild(canvas)
        
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        this.context = canvas.getContext('2d')
        this.canvas = canvas
    }

    loadImages() {
        for (let i = 0; i < this.mapData.length; i++){
            let img = new Image()

            img.setAttribute('crossOrigin', 'anonymous')
            img.src = '/assets/' + this.mapData[i].file
            img.id = this.mapData[i].id

            this.images.push(img)
        }
    }

    draw() {
        this.rect(0, 0, this.canvas.width, this.canvas.height, Color.blue)

        for (let row = 0; row < this.map.length; row++){
            for (let col = 0; col < this.map[row].length; col++) {
                let img = this.getImageFromId(this.map[row][col].id)
                this.context.drawImage(img, row * tileSize, col * tileSize)
            }
        }

        //Draw elements such as popups
        for (let i in this.elementsToDraw) {
            this.elementsToDraw[i].draw(this.context)
        }

        //Draw text elements
        for (let i in this.textToDraw) {
            this.textToDraw[i].draw(this.context)
        }

        window.requestAnimationFrame(() => this.draw())
    }

    getImageFromId(id) {
        for (let i = 0; i < this.images.length; i++) {
            if (id == this.images[i].id)
                return this.images[i]
        }
    }

    resize() {
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
    }

    rect(x, y, width, height, color) {
        this.context.fillStyle = color
        this.context.fillRect(x, y, width, height)
    }

    getCursorPosition(event) {
        const rect = this.canvas.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top   

        //Check which, if any, element was clicked on
        let elementIndex = this.getClickedElement(x, y)

        if (elementIndex != -1) {
            console.log('Element index clicked: ' + elementIndex)
        } else {
            this.elementsToDraw = []
            this.textToDraw = []
            this.createMapPopup(x, y)
        }
    }

    getClickedElement(x, y) {
        for (let i = this.elementsToDraw.length - 1; i >= 0; i--) {
            const element = this.elementsToDraw[i]
            const isInsideX = x >= element.x && x <= element.x + element.width
            const isInsideY = y >= element.y && y <= element.y + element.height
            
            if (isInsideX && isInsideY)
                return i
        }
        return -1
    }

    createMapPopup(x, y) {
        //TODO - Will need to change this once the map is moveable as it won't be x/tileSize - it'll be currentTile.x
        const tileX = Math.floor(x / tileSize)
        const tileY = Math.floor(y / tileSize)
        const tile = this.map[tileX][tileY]   
        
        //TODO - Make each text line an object that holds:
        //Text color, a bool to go to the newline, fontSize
        
        //TODO - Move this to the text draw method
        this.context.font = FontSizes.header + 'px Arial'

        let textLines = [
            tileX + ', ' + tileY,
            '',
            'Type: ' + tile.display
            //'Owner: ' + tile.owner
        ]

        //TODO - Once "getTileTextLines" is finished and the map has tiles assigned (x/y)
        //let textLines = this.getTileTextLines(tile)

        const maxWidth = this.getLargestTextWidth(textLines)
        const doubleBorder = borderWidth * 2

        let currentHeight = doubleBorder
        let addedHeight

        for (let i in textLines) {
            const textElement = new TextElement(x + doubleBorder, y + currentHeight, Color.white, FontSizes.header, textLines[i])
            this.textToDraw.push(textElement)
            addedHeight = textElement.fontSize + textElement.lineSpacing
            currentHeight += addedHeight
        }
        //To add the needed space below the final text element since it calculates from the top of the text
        currentHeight += addedHeight

        //Create the bounding rectangle around the text
        let outerRect = new RectElement(x, y, maxWidth + (borderWidth * 4), currentHeight, Color.lightBrown)
        let innerRect = new RectElement(x + borderWidth, y + borderWidth, outerRect.width - doubleBorder, outerRect.height - doubleBorder, Color.darkBrown)

        this.elementsToDraw.push(outerRect)
        this.elementsToDraw.push(innerRect)
    }

    getTileTextLines(tile) {
        this.context.font = FontSizes.header + 'px Arial'

        //TODO - Make each text line an object that holds:
        //Text color, a bool to go to the newline, fontSize, 
        //Add the text and find the largest width to know borders measurements
        let text = [
            tileX + ', ' + tileY,
            '',
            'Type: ' + tile.display
            //'Owner: ' + tile.owner
        ]
    }

    getLargestTextWidth(list) {
        let maxWidth = 0

        for (let i in list) {
            const width = this.context.measureText(list[i]).width

            if (width > maxWidth)
                maxWidth = width
        }
        return maxWidth
    }
}

class RectElement {

    constructor(x, y, width, height, color) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.color = color
    }

    draw(context) {
        context.fillStyle = this.color
        context.fillRect(this.x, this.y, this.width, this.height)
    }

}

class TextElement {

    constructor(x, y, color, fontSize, text) {
        this.color = color
        this.fontSize = fontSize
        this.font = fontSize + 'px Arial'
        
        this.x = x
        this.y = y + fontSize
        this.lineSpacing = 4

        this.text = text
    }

    draw(context) {
        context.font = this.font
        context.fillStyle = this.color
        context.fillText(this.text, this.x, this.y + this.lineSpacing)
    }

}