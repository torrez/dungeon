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
	let bubblesToAdd = 0;
    
    const scrollSpeed = 10;
    const backgroundColor1 = 'blue';
    const backgroundColor2 = 'darkblue';
    const playerSize = 20;
    const bubbleSize = 3;
	const bubbleCount = 3


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
        drawEverything();
    }

    function gameLoop(ts){
        drawEverything();
       
        if(keys[37] || keys[97]){
            movePlayer('left');
            if(previousDirection != 'left'){
				if (bubblesToAdd < 5){
					bubblesToAdd += 1;
				}
            }
            previousDirection = 'left';
        }
        if(keys[38] || keys[119]){
            movePlayer('up');
        }
        if(keys[39] || keys[100]){
            movePlayer('right');
            if(previousDirection != 'right'){
				if (bubblesToAdd < 5){
					bubblesToAdd += 1;
				}
            }
            previousDirection = 'right';
        }
        if(keys[40] || keys[115]){
            movePlayer('down');
        }

        if(previousTs > 0 && playerLocation[1] < canvasHeight - playerSize){
            playerLocation[1] = playerLocation[1] + ((ts - previousTs) * 1/50);
        }

		if(bubblesToAdd > 0){
			bubbles.push(new Bubble(augmentedX + playerLocation[0], playerLocation[1]));
			bubblesToAdd -= 1;
		}

		for(let i=0;i<bubbles.length;i++){
			let b = bubbles[i];
			if(b != null){
				b.y -= (.05 * (ts - previousTs));
				if (b.y < 0){
					delete bubbles[i];
				}
			}
		}	

        previousTs = ts;
       
		window.requestAnimationFrame(gameLoop);
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
                if (translatedX < canvasWidth){
					canvasContext.beginPath();
					canvasContext.arc(translatedX, b.y, b.size, 0, 2 * Math.PI);
                    canvasContext.strokeStyle = 'white';
					canvasContext.stroke();
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
    }

    let Bubble = function(x, y){
        this.x = x;
        this.y = y;
        this.size = Math.floor(Math.random() * bubbleSize) + 1;
    }
