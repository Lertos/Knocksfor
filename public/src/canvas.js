
export class Canvas {

    tileSize = 32

    backgroundColor = '#0f0530'


    images = []

    //TODO - make a class for a popup window and replace these with one single popup
    //and simply have these as getters for down below
    popupFGColor = '#3b2e04'
    popupBorderColor = '#806511'
    popupWindow = null
    selectedTile = null

    constructor(mapData, map) {
        this.mapData = mapData
        this.map = map

        let canvas = document.createElement('canvas')
        document.body.appendChild(canvas)

        
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        
        this.context = canvas.getContext('2d')
        
        this.canvas = canvas
        this.canvas.addEventListener('mousedown', (e) => { this.getCursorPosition(e) })
        
        window.onresize = () => { this.resize() }

        this.loadImages()
        this.draw()
    }

    loadImages() {
        //Loading images from the map data
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

        if (this.popupWindow != null && this.popupWindow != undefined) {
            const x = this.popupWindow.x
            const y = this.popupWindow.y

            this.rect(x, y, 135, 195, this.popupBorderColor)
            this.rect(x + 5, y + 5, 125, 185, this.popupFGColor)
            this.context.font = "20px Arial";
            this.context.fillStyle = "white";
            this.context.fillText(this.selectedTile.display, x + 20, y + 44);
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

        console.log("x: " + tileX + " y: " + tileY)
        console.log(this.map[tileX][tileY])
        this.popupWindow = { x: x, y: y }
        this.selectedTile = this.map[tileX][tileY]
    }

}