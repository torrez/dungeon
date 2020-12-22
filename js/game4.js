    let canvas;
    let canvasContext;
    let test = 0;
    let oldX=oldY=100;
    
    
    let degrees = 45;
    const framesPerSecond = 30;
    const keepRunning = true;
    const r=5;

    window.onload = function(){
        canvas = document.getElementById('game');
        ctx = canvas.getContext('2d');

        document.addEventListener('keypress', keyPress);
        document.addEventListener('keydown', keyPress);


        setInterval(game, 1000/framesPerSecond);
    }


    function game(){
        ctx.fillStyle = 'pink';
        ctx.fillRect(0, 0, canvas.width, canvas.height);


        let newX = oldX + (r * Math.cos(degrees * Math.PI / 180));
        let newY = oldY + (r * Math.sin(degrees * Math.PI / 180));

        ctx.fillStyle = 'black';
        ctx.font = '12px Helvetica';
        ctx.fillText(test, newX, newY);
        oldX = newX;
        oldY = newY;
        test++;

        /*
        ctx.save();
        ctx.translate(50, 50);
        if(test > 360){
            test = 0;
        }
        ctx.rotate(test * Math.PI / 180);
        ctx.fillStyle = 'black';
        ctx.font = '12px Helvetica';
        ctx.fillText(test, 0, 0);
        //ctx.draw //your drawing function
        ctx.translate(-50, -50);
        ctx.restore();
        */
    }

    function keyPress(evt){
        switch(evt.which){
            case 38:	
            case 119:
                degrees+=5;
                break;
            case 40:
            case 115:
                degrees-=5;
        }
    }
