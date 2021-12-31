
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
let borderWidth = 4


export class Canvas {

    images = []
    elementsToDraw = []
    textToDraw = []
    
    constructor(mapData, map, startX, startY) {
        this.mapData = mapData
        this.map = map

        this.tileSize = 32

        //TODO - This will come from the players current position
        this.currentTile = {
            x: startX,
            y: startY
        }
        
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
                this.context.drawImage(img, col * this.tileSize, row * this.tileSize)
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

    clearDrawnElements() {
        this.elementsToDraw = []
        this.textToDraw = []
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
            this.clearDrawnElements()
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

    getClickedTile(x, y) {
        const tileX = Math.floor(x / this.tileSize)
        const tileY = Math.floor(y / this.tileSize)

        //If clicked off the map
        if (tileX > this.map.length || tileY > this.map[0].length)
            return -1

        //If clicked on water tiles - show nothing
        if (this.map[tileY][tileX].id == 'water')
            return -1
        
        return this.map[tileY][tileX]  
    }

    createMapPopup(x, y) {
        const tile = this.getClickedTile(x, y)

        if (tile == -1)
            return

        let textLines = this.getTileTextLines(tile)

        const maxWidth = this.getLargestTextWidth(textLines)
        const padding = borderWidth * 2

        const finalHeight = this.createTextElements(textLines, padding, x, y)

        //Create the bounding rectangle around the text (the popup)
        let outerRect = new RectElement(x, y, maxWidth + (borderWidth * 4), finalHeight, Color.lightBrown)
        let innerRect = new RectElement(x + borderWidth, y + borderWidth, outerRect.width - padding, outerRect.height - padding, Color.darkBrown)

        this.elementsToDraw.push(outerRect)
        this.elementsToDraw.push(innerRect)
    }

    createTextElements(textLines, padding, startX, startY) {
        let currentX = startX + padding
        let currentY = startY + padding
        let totalheight = padding
        let fontSpacing

        let newLine = false

        for (let i in textLines) {

            if (newLine) {
                currentX = startX + padding
                currentY += fontSpacing
                totalheight += fontSpacing
            }

            const textElement = new TextElement(currentX, currentY, textLines[i])
            this.textToDraw.push(textElement)

            //Save this for the next iteration
            fontSpacing = textElement.fontSize + textElement.lineSpacing

            if (!textLines[i].newLine) {
                currentX += textElement.getWidth(this.context)
                newLine = false
            } else {
                newLine = true
            }
        }

        return totalheight + fontSpacing * 2
    }

    getTileTextLines(tile) {
        let textLines = []
        textLines.push(this.getTileObject(tile.x + ', ' + tile.y, FontSizes.normal, Color.white, false))
        textLines.push(this.getTileObject('Type: ' + tile.display, FontSizes.normal, Color.white, true))
        
        if (tile.hasOwnProperty('level'))
            textLines.push(this.getTileObject('Level: ' + tile.level, FontSizes.normal, Color.white, true))
        if (tile.hasOwnProperty('owner'))
            textLines.push(this.getTileObject('Owner: ' + tile.owner, FontSizes.normal, Color.red, true))

        return textLines
    }

    getTileObject(text, fontSize, color, newLine) {
        return {
            text: text,
            fontSize: fontSize,
            color: color,
            newLine: newLine
        }
    }

    //TODO - Check for newline and add width if so
    getLargestTextWidth(list) {
        let maxWidth = 0

        for (let i in list) {
            this.context.font = list[i].fontSize + 'px Arial'
            const width = this.context.measureText(list[i].text).width

            if (width > maxWidth) {
                maxWidth = width
            }
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

    constructor(x, y, textObj) {
        this.color = textObj.color
        this.fontSize = textObj.fontSize
        this.font = textObj.fontSize + 'px Arial'
        
        this.x = x
        this.y = y + this.fontSize
        
        this.text = textObj.text
        this.lineSpacing = 4
    }

    draw(context) {
        context.font = this.font
        context.fillStyle = this.color
        context.fillText(this.text, this.x, this.y + this.lineSpacing)
    }

    getWidth(context) {
        context.font = this.font
        return context.measureText(this.text).width + this.getSpaceWidth(context)
    }

    getSpaceWidth(context) {
        context.font = this.font
        return context.measureText(' ').width
    }

}