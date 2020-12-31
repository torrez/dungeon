    let canvas;
    let canvasContext;
    let oldX = newX = 20;
	let oldY = newY = 500;
    let degrees = 0;
	let currentSpeed = 5;
	let buildings = [];
	let crash = false;
	let isStalling = false;
	let smokes = [];
	let smoking = false;
	let keys = [];

	const planeWidth = 20;
	const planeHeight = 6;
	const speed = 7;
	const maxBuildingWidth = 40;
	const maxBuildingHeight = 60;
	const buildingColors = ['#ccc', '#ddd', '#aaa', '#c6c6c6', '#adadad'];
	const smokeLevels = ['#aaa', '#bbb', '#ccc', '#ddd', '#eee', '#fff'];

    window.onload = function(){
        canvas = document.getElementById('game');
        ctx = canvas.getContext('2d');

		setUp();
		window.requestAnimationFrame(gameLoop);
    }

    document.addEventListener("keydown", function (e) {
		if(isStalling){
			return;
		}
        keys[e.keyCode] = true;
    });
    document.addEventListener("keyup", function (e) {
		if(isStalling){
			return;
		}
        keys[e.keyCode] = false;
    });

	let building = function(x, y, width, height, color){
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.color = color;
	}

	let smoke = function(x, y, timeStamp){
		this.x = x;
		this.y = y;
		this.timeStamp = timeStamp;
		this.smokeLevel = 0;
	}

	function setUp(){
		let nextX = 0;
		while(nextX <= canvas.width){
			let buildingWidth = Math.floor(Math.random() * maxBuildingWidth + 2);
			let buildingHeight = Math.floor(Math.random() * maxBuildingHeight + 2);
			let buildingColor = buildingColors[Math.floor(Math.random() * buildingColors.length)];
			let b = new building(nextX, canvas.height - buildingHeight, buildingWidth, buildingHeight, buildingColor);
			buildings.push(b);
			nextX += buildingWidth;
		}
	}

	function gameLoop(timeStamp){
		draw();

        if(keys[38] || keys[119]){
                degrees+=2;
		}

        if(keys[40] || keys[115]){
                degrees-=2;
		}
		if(keys[32]){
			if(smoking){
				smoking = false;
			}else{
				smoking = true;
			}
        }



		//If in a stall turn in the appropriate direction
		if(isStalling){
			if(((degrees > 90) && (degrees < 270)) || ((degrees <= -90) && (degrees > -270))){
				degrees -= 1;
			}else if((degrees >= -90) || (degrees > 270)){
				degrees += 1;
			}

			//Break out of the stall if you're low enough and pointed down
			if((newY > 50) && ((degrees <= 180) || (degrees <= 0)) ){
				isStalling = false;
			}
		}

		//Don't go farther than 360 either way
		if(Math.abs(degrees) > 360){
			degrees = 0;
		}

		if(smoking){
			smokes.push(new smoke(oldX, oldY, timeStamp));
		}

        newX = (oldX + (currentSpeed * Math.cos(degrees * Math.PI / 180)));
        newY = (oldY + (currentSpeed * Math.sin(degrees * Math.PI / 180)));
        oldX = newX;
        oldY = newY;

		currentSpeed = speed * newY/canvas.height;

		//Bloop
		if (newX >= canvas.width){
			oldX = 0;
		}
		if (newX <= 0){
			oldX = canvas.width;
		}

		//Don't crash
		if(planeOverlapsWithBuilding(newX, newY, planeWidth, planeHeight)){
			crash = true;
		}

		if(newY < 50){
			isStalling = true;
		}

		for(let i=0;i<smokes.length;i++){
			if (smokes[i] != null){
				let diff = timeStamp - smokes[i].timeStamp;
				let s = smokes[i];

				//This could be better.
				if(diff < 5000){
					s.smokeLevel = 1;
				}else if (diff < 9000){
					s.smokeLevel = 2;
				} else if (diff < 12000){
					s.smokeLevel = 3;
				}else if (diff < 15000){
					s.smokeLevel = 4;
				}else if (diff < 20000){
					s.smokeLevel = 5;
				}else{
					delete smokes[i];
				}
			}
		}

		//Loop loop loop
		window.requestAnimationFrame(gameLoop);
	}

	//Too fancy
	function planeOverlapsWithBuilding(x, y, width, height){
		let topLeft1 = [x, y];
		let bottomRight1 = [x + width - 1, y + height - 1];
		for (let i=0;i<buildings.length;i++){
			let b = buildings[i];
			let topLeft2 = [b.x, b.y];
			let bottomRight2 = [b.x + width - 1, b.y + height - 1];

			if (topLeft1[0] > bottomRight2[0] || topLeft2[0] > bottomRight1[0]) {
				continue; 
			}else if (topLeft1[1] > bottomRight2[1] || topLeft2[1] > bottomRight1[1]) {
				continue;
			}
			return true;
		}
		return false;
	}

    function draw(){
		if (crash){
			return;
		}

        ctx.fillStyle = '#addfff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

		for(let i=0;i<buildings.length;i++){
			let b = buildings[i];
			ctx.fillStyle = b.color;
			ctx.fillRect(b.x, b.y, b.width, b.height);
		}

		//This is wild.
        ctx.fillStyle = 'white';
        ctx.save();
		translatedNewX = newX + (planeWidth / 2);
		translatedNewY = newY + (planeHeight / 2);
        ctx.translate(translatedNewX, translatedNewY);
        ctx.rotate(degrees * Math.PI / 180);
        ctx.translate(-1 * translatedNewX , -1 * translatedNewY);
        ctx.fillRect(newX, newY, planeWidth, planeHeight);
        ctx.restore();

		//Draw some smoke
		smokes.forEach(function(s){
			ctx.fillStyle = smokeLevels[s.smokeLevel];
			ctx.fillRect(s.x, s.y, 5, 5);
		});
    }

