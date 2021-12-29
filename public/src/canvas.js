
//TODO - add color enums

//TODO - add states such as "map", "city, "popup" - perhaps try buttons to change the state


export class Canvas {

    tileSize = 32

    backgroundColor = '#0f0530'

    images = []
    //TODO - Make logic to have elements added in proper order and then
    //call all their draw methods
    elementsToDraw = []
    
    constructor(mapData, map) {
        this.mapData = mapData
        this.map = map
        
        this.createCanvas()
        this.canvas.addEventListener('mousedown', (e) => { this.getCursorPosition(e) })

        this.popup = new Popup(120, 180, 3, 4, '#4a4343', '#383131', '#ffffff')
        
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
        this.rect(0, 0, this.canvas.width, this.canvas.height, this.backgroundColor)

        for (let row = 0; row < this.map.length; row++){
            for (let col = 0; col < this.map[row].length; col++) {
                let img = this.getImageFromId(this.map[row][col].id)
                this.context.drawImage(img, row * this.tileSize, col * this.tileSize)
            }
        }

        this.popup.draw(this.context)

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

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    getCursorPosition(event) {
        const rect = this.canvas.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
        
        const tileX = Math.floor(x / this.tileSize)
        const tileY = Math.floor(y / this.tileSize)

        //TODO - Need to check if the click was on a popup window
        //If so - perhaps have a popup class that would check where the click was on the
        //  popup and proceed accordingly
        //If not - then you can assume it was on the map and show the info requested
        if (this.popup.x != null) {
            const insideX = x >= this.popup.x && x <= this.popup.x + this.popup.width
            const insideY = y >= this.popup.y && y <= this.popup.y + this.popup.height
            
            if (insideX && insideY)
                console.log('Inside border')
        }

        this.popup.setX(x)
        this.popup.setY(y)
        this.popup.setTile(this.map[tileX][tileY])
    }

}

class Popup {

    x = null
    y = null
    tile = null
    //TODO - dont need class for buttons, but could make objects that hold top, left, width, height,
    //then also text, color, bgcolor (border), width, then the func to run
    buttons = []

    constructor(width, height, borderWidth, padding, borderColor, mainColor, textColor) {
        this.width = width
        this.height = height

        this.borderWidth = borderWidth
        this.padding = padding
        
        this.borderColor = borderColor
        this.mainColor = mainColor
        this.textColor = textColor

        this.font = '20px Arial'
        this.fontSize = 20
    }

    setFont(size, font) {
        this.font = size + 'px ' + font
        this.fontSize = size
    }

    setX(x) {
        this.x = x
    }

    setY(y) {
        this.y = y
    }

    setTile(tile) {
        this.tile = tile
    }

    clear() {
        this.x = null
        this.y = null
        this.tile = null
    }

    draw(context) {
        if (this.x != null && this.y != null && this.tile != null) {
            //Border
            context.fillStyle = this.borderColor
            context.fillRect(this.x, this.y, this.width, this.height)

            let borderX = this.x + this.borderWidth
            let borderY = this.y + this.borderWidth
            let innerX = this.width - (this.borderWidth * 2)
            let innerY = this.height - (this.borderWidth * 2)

            //Main screen
            context.fillStyle = this.mainColor
            context.fillRect(borderX, borderY, innerX, innerY)

            //Text
            let totalFontSize = this.fontSize + 2 + this.padding

            context.font = this.font
            context.fillStyle = this.textColor;
            context.fillText(this.tile.display, borderX + this.padding, borderY + totalFontSize);
            context.fillText(Math.floor(this.x / 32) + ', ' + Math.floor(this.y / 32), this.x + 20, this.y + 74);
        }
    }



}