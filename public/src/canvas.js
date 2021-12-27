
export class Canvas {

    canvas
    context

    backgroundColor = "#0f0530"

    constructor() {
        let canvas = document.createElement('canvas')
        document.body.appendChild(canvas)

        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
         
        const context = canvas.getContext('2d')
        
        this.canvas = canvas
        this.context = context
        
        window.onresize = () => { this.resize() }

        this.draw()
    }

    draw() {
        this.rect(0, 0, this.canvas.width, this.canvas.height, this.backgroundColor)

        window.requestAnimationFrame(() => this.draw())
    }

    resize() {
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
        //console.log(this.canvas.width, this.canvas.height)
    }

    rect(x, y, width, height, color) {
        this.context.fillStyle = color
        this.context.fillRect(x, y, width, height)
    }

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

}