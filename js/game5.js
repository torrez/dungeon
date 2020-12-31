    "use strict";

    let canvas;
    let canvasContext;
    let canvasWidth;
    let canvasHeight;
    let cursor;
    let bgx1;
    let bgx2; 
    let playerLocation;
    let keys = [];
    let previousTs = 0;
    let bubbles = [];
    let previousDirection = 'right';
    let augmentedX = 0;
    
    const scrollSpeed = 10;
    const backgroundColor1 = 'blue';
    const backgroundColor2 = 'darkblue';
    const playerSize = 20;
    const bubbleSize = 8;


    function init(){
        canvas = document.getElementById('game');
        canvasContext = canvas.getContext('2d');

        canvasWidth = canvas.width;
        canvasHeight = canvas.height;

        playerLocation = [canvasWidth/2, canvasHeight/2];

        bgx1 = 0;
        bgx2 = canvasWidth;
        augmentedX = playerLocation[0];

        setup();
		window.requestAnimationFrame(gameLoop);
    }

    document.addEventListener("keydown", function (e) {
        keys[e.keyCode] = true;
    });
    document.addEventListener("keyup", function (e) {
        keys[e.keyCode] = false;
    });

    window.onload = init;

    function setup(){
        createLevel();
        drawEverything();
    }

    function gameLoop(ts){
        drawEverything();
       
        if(keys[37] || keys[97]){
            movePlayer('left');
            if(previousDirection != 'left'){
                makeBubbles(playerLocation);
            }
            previousDirection = 'left';
        }
        if(keys[38] || keys[119]){
            movePlayer('up');
        }
        if(keys[39] || keys[100]){
            movePlayer('right');
            if(previousDirection != 'right'){
                makeBubbles(playerLocation);
            }
            previousDirection = 'right';
        }
        if(keys[40] || keys[115]){
            movePlayer('down');
        }

        if(previousTs > 0 && playerLocation[1] < canvasHeight - playerSize){
            playerLocation[1] = playerLocation[1] + ((ts - previousTs) * 1/50);
        }
        previousTs = ts;

		bubbles.forEach(function(s){
            s.y -= 3;
		});
       
        debug();
		window.requestAnimationFrame(gameLoop);
    }

    function debug(){
        //console.log(augmentedX);
    }



    function drawEverything(){
        drawBackground();
        //drawShader();
        drawPlayer();
        drawBubbles();
    }


    function drawBackground(){
        //safety pink (nobody should see this)
        canvasContext.fillStyle='pink';
        canvasContext.fillRect(0,0,canvasWidth, canvasHeight);

        //draw 1
        canvasContext.fillStyle=backgroundColor1;
        canvasContext.fillRect(bgx1, 0, canvasWidth, canvasHeight); 

        //draw 2
        canvasContext.fillStyle=backgroundColor2;
        canvasContext.fillRect(bgx2, 0, canvasWidth, canvasHeight); 
    }

    function drawShader(){
        canvasContext.fillStyle = 'darkGrey';
        canvasContext.fillRect(300, 0, 200, canvasHeight);
    }

    function drawPlayer(){
        canvasContext.fillStyle = 'yellow';
        canvasContext.fillRect(playerLocation[0], playerLocation[1], playerSize, playerSize);
    }

    function drawBubbles(){
		bubbles.forEach(function(b){
            if(b.x > augmentedX){
                let translatedX = b.x - augmentedX;
                console.log("TRANSLATED" + translatedX);
                if (translatedX < canvasWidth){
                    canvasContext.fillStyle = 'white';
                    canvasContext.fillRect(translatedX, b.y, b.size, b.size);
                }
            }
		});
    }

    function movePlayer(direction){
        if(direction == 'left'){
            if(playerLocation[0] - scrollSpeed > 300){
                playerLocation[0] -= scrollSpeed;
            }else{
                if (bgx1 >= canvasWidth){
                    bgx1 = -canvasWidth;
                }
                bgx1 += scrollSpeed;
                augmentedX -= scrollSpeed;
            }
        }else if(direction == 'right'){
            if(playerLocation[0] + scrollSpeed < 500){
                playerLocation[0] += scrollSpeed; 
            }else{
                if (bgx1 <= -canvasWidth){
                    bgx1 = canvasWidth;
                }
                bgx1 -= scrollSpeed;
                augmentedX += scrollSpeed;
            }
        }else if(direction == 'up'){
            if(playerLocation[1] > 5){
                playerLocation[1]-=5;
            }
        }else if(direction == 'down'){
            if(playerLocation[1] < canvasHeight - playerSize){
                playerLocation[1]+=5;
            }
        }

        //depending on where bgx1 is
        //we should place bgx2 behind
        //it or in front of it
        if(bgx1 >= 0){
            bgx2 = bgx1 - canvasWidth;
        }else if(bgx1 <= 0){
            bgx2 = bgx1 + canvasWidth;
        }
        
        
        console.log({playerX:playerLocation[0], augmentedX:augmentedX});
    }

    let Bubble = function(x, y){
        this.x = x;
        this.y = y;
        this.size = Math.floor(Math.random() * bubbleSize) + 1;
    }

    function makeBubbles(loc){
        bubbles.push(new Bubble(augmentedX + playerLocation[0], loc[1]));
    }

    function createLevel(){

    }
