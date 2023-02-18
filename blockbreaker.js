export class Breakout {

    constructor(canvas, keyMap) {

        // save canvas and keyMap as members
        this.canvas = canvas;
        this.keyMap = keyMap;
        
        // set size of canvas
        canvas.width = 640;
        canvas.height = 280;
        
        // save canvas context as member
        this.ctx = canvas.getContext('2d'); 

        // Set up the box (bouncing around the screen)
        // BALL BOX
        this.ball = new Box();
        this.ball.xVel = 3; // units: pixels per frame
        this.ball.yVel = 3;
        this.ball.minX = canvas.width / 2;
        this.ball.minY = 200;
        this.ball.width = 15;
        this.ball.height = 15;
        this.ball.color = [192,192,192];
        this.ball.isBall = true;

        // LOWER PADDLE
        this.paddle = new Box();
        this.paddle.minX = canvas.width / 2 - 55;
        this.paddle.minY = canvas.height - 30;
        this.paddle.width = 120;
        this.paddle.height = 10;
        this.isPaddle = true;
        this.paddle.isBreakable = false;
        this.paddle.color = [255, 255, 255];       

        this.blocks = [];
        // change i to 10 for whole row
        for(let i = 0; i < 4; i++) {
            let spacing = 18
            for(let j = 0; j < 10; j++) {
                this.blocks[i * 10 + j] = new Box();
                this.blocks[i * 10 + j].minX = 10 + j * 62;
                this.blocks[i * 10 + j].minY = 45 + i * spacing;
                this.blocks[i * 10 + j].width = 60;
                this.blocks[i * 10 + j].height = 15;
                this.blocks[i * 10 + j].isPaddle = false; // for paddle
                this.blocks[i * 10 + j].isBall = false; // for ball
                this.blocks[i * 10 + j].isBreakable = true; // for blocks
                this.blocks[i * 10 + j].isActive = true; // for blocks
                this.blocks[i * 10 + j].randomizeColor();
            }
        }


        // prevDraw is a member variable used for throttling framerate
        this.prevDraw = 0;
        
        // state variables
        this.gameOver = false;
        this.paused = false;

                
    }
    
    mainLoop() {
        // Compute the FPS
        // First get #milliseconds since previous draw
        const elapsed = performance.now() - this.prevDraw;

        if (elapsed < 1000/60) {
            return;
        }
        // 1000 seconds = elapsed * fps. So fps = 1000/elapsed
        const fps = 1000 / elapsed;
        // Write the FPS in a <p> element.
        document.getElementById('fps').innerHTML = fps;

        this.update();
        this.draw();
    }
    
    update() {
        // Update the obstacle using keyboard info
        if (this.keyMap['ArrowLeft']) {
            this.paddle.minX -= 5;
            if (this.paddle.minX < 0) {
                this.paddle.minX = 0;
            }
        }
        if (this.keyMap['ArrowRight']) {
            this.paddle.minX += 5;
            if (this.paddle.minX + this.paddle.width > this.canvas.width) {
                this.paddle.minX = this.canvas.width - this.paddle.width;
            }
        }
        
        if (this.keyMap['p'] && !this.gameOver) {
            this.paused = !this.paused;
        }
        
        if (this.paused) {
            return;
        }

        // Update the box (move, bounce, etc. according to box.xVel and box.yVel)
        let obstacles = [this.paddle];
        for(let i = 0; i < this.blocks.length; i++) {
            obstacles.push(this.blocks[i]);
        }
        
        // establishing boundaries
        const topEdge = new Box();
        topEdge.minX = 0;
        topEdge.minY = -10;
        topEdge.width = this.canvas.width;
        topEdge.height = 10;
        obstacles.push(topEdge);
        
        // comment this for loss mechanism
        const bottomEdge = new Box();
        bottomEdge.minX = 0;
        bottomEdge.minY = this.canvas.height;
        bottomEdge.width = this.canvas.width;
        bottomEdge.height = 10;
        obstacles.push(bottomEdge);

        const leftEdge = new Box();
        leftEdge.minX = -10;
        leftEdge.minY = 0;
        leftEdge.width = 10;
        leftEdge.height = this.canvas.height;
        obstacles.push(leftEdge);
        
        const rightEdge = new Box();
        rightEdge.minX = this.canvas.width;
        rightEdge.minY = 0;
        rightEdge.width = 10;
        rightEdge.height = this.canvas.height;
        obstacles.push(rightEdge);
        
        this.ball.update(obstacles);
        console.log("Update:", obstacles)
        console.log("Blocks:", this.blocks, this.blocks.length)


        // uncomment this for loss mechanism
        // Check for winning
        // if ((this.ball.minY + this.ball.height) > this.canvas.height) {
        //     // ball at the bottom
        //     this.gameOver = true;
        //     this.winner = 2;
        // }

    }
    
    draw() {
        // clear background
        this.ctx.fillStyle = "rgb(10, 10, 10)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);        
        
        if (this.paused) {
            this.ctx.font = "30px serif";
            this.ctx.textAlign = "center";            
            this.ctx.fillStyle = "rgb(255,0,0)";
            this.ctx.fillText("PAUSED", this.canvas.width/2, this.canvas.height/2);
        }

        // potentially draw victory text
        if (this.gameOver) {
            let x = "You lose";
            if (this.winner == 1) {
                x = "You win";
            }
            this.ctx.font = "30px serif";
            this.ctx.textAlign = "center";
            this.ctx.fillStyle = 'rgb(255,255,255)';
            this.ctx.fillText(x, this.canvas.width/2, this.canvas.height/2)            
        }
        
        // Draw the box
        this.ball.draw(this.ctx);
        this.paddle.draw(this.ctx);
        for(let i = 0; i < this.blocks.length; i++) {
            this.blocks[i].draw(this.ctx);
        }

        // Save the value of performance.now() for FPS calculation
        this.prevDraw = performance.now();
    }
}

class Box {
    constructor() {
        this.minX = 10;
        this.minY = 30;
        this.width = 20;
        this.height = 20;
        this.xVel = 1;
        this.yVel = 1;
        this.isPaddle = false; // for paddle
        this.isBall = false; // for ball
        this.isBreakable = true; // for blocks
        this.isActive = true; // for blocks
        this.color = [255, 0, 0];
    }

    randomizeColor() {
        this.color[0] = Math.round(Math.random()*255);
        this.color[1] = Math.round(Math.random()*255);
        this.color[2] = Math.round(Math.random()*255);
    }
    
    intersects(box2) {
        // the x-intervals
        const xi1 = [this.minX, this.minX + this.width];
        const xi2 = [box2.minX, box2.minX + box2.width];
        
        if (!intervalsOverlap(xi1, xi2)) {
            return false;
        }
        
        const yi1 = [this.minY, this.minY + this.height];
        const yi2 = [box2.minY, box2.minY + box2.height];
        
        return intervalsOverlap(yi1, yi2);
    }

    update(obstacles) {
        // move x and y

        // move x
        this.minX += this.xVel;

        for (const o of obstacles) {
            if (this.intersects(o)) {
                // undo the step that caused the collision
                this.minX -= this.xVel;
                if(o.isBreakable === true) {
                    o.randomizeColor();
                    o.minY = -1000;
                }
                // reverse xVel to bounce
                this.xVel *= -1;
                
                // this.randomizeColor();
            }
        }

        // move y
        this.minY += this.yVel;

        for (const o of obstacles) {
            if (this.intersects(o)) {
                // undo the step that caused the collision
                this.minY -= this.yVel;
                if(o.isBreakable === true) {
                    o.randomizeColor();
                    o.minY = -1000;
                }
                // reverse yVel to bounce
                this.yVel *= -1;
                
                // this.randomizeColor();
            }   
        }
    }

    draw(ctx) {
        const [r,g,b] = this.color;
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(this.minX, this.minY, this.width, this.height);                
    }

}

function intervalsOverlap(int1, int2) {
    const [a,b] = int1;
    const [c,d] = int2;
    if (a > c) {
        return intervalsOverlap(int2, int1);
    }
    return (b > c);
}
