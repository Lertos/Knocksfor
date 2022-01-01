
const Color = {
    white: '#ffffff',
    red: '#d60000',
    blue: '#4275cf',
    yellow: '#e8eb34',
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
    normal: 16,
    small: 12
}

const FontAlign = {
    center: 'center',
    left: 'left',
    right: 'right'
}

let currentState = State.map
let borderWidth = 4
let lineSpacing = 6


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

        const finalHeight = this.createTextElements(textLines, padding, x, y, maxWidth)

        //Create the bounding rectangle around the text (the popup)
        let outerRect = new RectElement(x, y, maxWidth + (borderWidth * 4), finalHeight, Color.lightBrown)
        let innerRect = new RectElement(x + borderWidth, y + borderWidth, outerRect.width - padding, outerRect.height - padding, Color.darkBrown)

        this.elementsToDraw.push(outerRect)
        this.elementsToDraw.push(innerRect)
    }

    createTextElements(textLines, padding, startX, startY, maxLineWidth) {
        const lineHeights = this.getEachLineHeight(textLines)
        let totalheight = padding

        let lineXPos = startX + padding
        let lineYPos = startY + padding

        let currentLineX = 0
        
        let newLine = false

        for (let i in textLines) {
            if (newLine) {
                totalheight += lineHeights[i]
                currentLineX = 0

                lineXPos = startX
                lineYPos += lineHeights[i-1]
            }
            const xOffset = this.getXOffsetOfLine(textLines[i], currentLineX, maxLineWidth)

            const textElement = new TextElement(lineXPos + xOffset + padding, lineYPos, textLines[i])
            this.textToDraw.push(textElement)

            if (!textLines[i].newLineAfter) { 
                lineXPos += textElement.getWidth(this.context)
                currentLineX = textElement.getWidth(this.context)
                newLine = false
            } else {
                newLine = true
            }
        }

        const finalLinePadding = lineHeights[lineHeights.length-1] + padding * 2
        return totalheight + finalLinePadding
    }

    getXOffsetOfLine(line, currentX, maxLineWidth) {
        if (line.alignment == FontAlign.left)
            return 0
        
        if (line.alignment == FontAlign.center) {
            const remainingWidth = maxLineWidth - currentX
            const difference = Math.floor((remainingWidth - this.context.measureText(line.text).width) / 2)
            return difference
        }
        //TODO - Align right
    }

    getEachLineHeight(list) {
        let heights = []

        let maxHeight = 0
        let stopAtIndex = -1
        
        for (let i in list) {
            //If the current iteration should just use the maxHeight as it's the same line
            if (stopAtIndex != -1 && i <= stopAtIndex) {
                if (i == stopAtIndex)
                    stopAtIndex = -1
            
                heights[i] = maxHeight + lineSpacing
                continue
            }

            //If the current iteration isn't the final text in this entire line - find the maxHeight
            if (!list[i].newLineAfter) {
                maxHeight = list[i].fontSize
                stopAtIndex = i

                for (let j = i; j < list.length; j++) {
                    if (list[j].fontSize > maxHeight)
                        maxHeight = list[j].fontSize
                        
                    if (list[j].newLineAfter) {
                        stopAtIndex = j
                        break
                    }
                }
            }
            //If the current text is by itself simply add the height
            heights[i] = list[i].fontSize + lineSpacing
        }
        return heights
    }

    getTileTextLines(tile) {
        let textLines = []
        textLines.push(this.getTileObject('( ' + tile.x + ', ' + tile.y + ' )', FontSizes.small, Color.white, true, FontAlign.center))
        textLines.push(this.getTileObject('Type:', FontSizes.normal, Color.white, false, FontAlign.left))
        textLines.push(this.getTileObject(tile.display, FontSizes.normal, Color.yellow, true, FontAlign.left))
        
        if (tile.hasOwnProperty('level')) {
            textLines.push(this.getTileObject('Level:', FontSizes.normal, Color.white, false, FontAlign.left))
            textLines.push(this.getTileObject(tile.level, FontSizes.normal, Color.yellow, true, FontAlign.left))
        }
        if (tile.hasOwnProperty('owner')) {
            textLines.push(this.getTileObject('Owner:', FontSizes.normal, Color.white, false, FontAlign.left))
            textLines.push(this.getTileObject(tile.owner, FontSizes.normal, Color.red, true, FontAlign.left))
        }

        return textLines
    }

    getTileObject(text, fontSize, color, newLineAfter, alignment) {
        return {
            text: text,
            fontSize: fontSize,
            color: color,
            newLineAfter: newLineAfter,
            alignment: alignment
        }
    }

    getLargestTextWidth(list) {
        let maxWidth = 0
        let lineWidth = 0

        let newLine = false

        for (let i in list) {

            if (newLine)
                lineWidth = 0

            this.context.font = list[i].fontSize + 'px Arial'
            lineWidth += this.context.measureText(list[i].text).width

            if (lineWidth > maxWidth)
                maxWidth = lineWidth

            if (!list[i].newLineAfter) {
                lineWidth += this.context.measureText(' ').width
                newLine = false
            }
            else
                newLine = true
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
    }

    draw(context) {
        context.font = this.font
        context.fillStyle = this.color
        context.fillText(this.text, this.x, this.y + lineSpacing)
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