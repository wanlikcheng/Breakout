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
        this.ball.minX = 300;
        this.ball.minY = 200;
        this.ball.width = 20;
        this.ball.height = 20;
        this.ball.isBall = true;

        // Set up the obstacle (paddle on the left side)
        // LOWER PADDLE
        this.obstacle = new Box();
        this.obstacle.minX = canvas.width / 2;
        this.obstacle.minY = canvas.height - 50;
        this.obstacle.width = 120;
        this.obstacle.height = 10;
        this.isPaddle = true;
        this.obstacle.color = [255, 255, 255];       
        
        // Set up the CPU's paddle
        // UPPER BOXES
        this.cpuPaddle = new Box();
        this.cpuPaddle.minX = 240 - 100;
        this.cpuPaddle.minY = 40;
        this.cpuPaddle.width = 80;
        this.cpuPaddle.height = 30;
        this.cpuPaddle.color = [0, 0, 255];

        this.test = new Box();
        this.test.minX = 240;
        this.test.minY = 40;
        this.test.width = 80;
        this.test.height = 30;
        this.test.color = [0, 0, 255];

        this.blocks = [];
        for(let i = 0; i < 5; i++) {
            this.blocks[i] = new Box();
            this.blocks[i].minX = 40 + i * 81;
            this.blocks[i].minY = 90;
            this.blocks[i].width = 80;
            this.blocks[i].height = 30;
            this.blocks[i].isPaddle = false; // for paddle
            this.blocks[i].isBall = false; // for ball
            this.blocks[i].isBreakable = true; // for blocks
            this.blocks[i].isActive = true; // for blocks
            this.blocks[i].color = [255, 0, 0];
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
            this.obstacle.minX -= 5;
            if (this.obstacle.minX < 0) {
                this.obstacle.minX = 0;
            }
        }
        if (this.keyMap['ArrowRight']) {
            this.obstacle.minX += 5;
            if (this.obstacle.minX + this.obstacle.width > this.canvas.width) {
                this.obstacle.minX = this.canvas.width - this.obstacle.width;
            }
        }
        
        if (this.keyMap['p'] && !this.gameOver) {
            this.paused = !this.paused;
        }
        
        if (this.paused) {
            return;
        }

        // Update the box (move, bounce, etc. according to box.xVel and box.yVel)
        let obstacles = [this.obstacle, this.cpuPaddle, this.test];
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
        console.log("Blocks:", this.blocks)


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
        this.obstacle.draw(this.ctx);
        this.cpuPaddle.draw(this.ctx);
        this.test.draw(this.ctx);
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
                
                // reverse xVel to bounce
                this.xVel *= -1;
                
                this.randomizeColor();
            }
        }

        // move y
        this.minY += this.yVel;

        for (const o of obstacles) {
            if (this.intersects(o)) {
                // undo the step that caused the collision
                this.minY -= this.yVel;
                if(o.isBreakable) {
                    o.randomizeColor();
                }
                // reverse yVel to bounce
                this.yVel *= -1;
                
                this.randomizeColor();
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
