    var canvas;
    var canvasContext;
    var pd = 10;
    var cellSize = 40;
    var cells = [];
    var wallThickness = 5;
    var columns;
    var rows;
    var currentCell = {};
    var hasWon = false;

    window.onload=function(){
            canvas = document.getElementById('game');
            canvasContext = canvas.getContext('2d');
            document.addEventListener('keypress', keyPress);
            document.addEventListener('keydown', keyPress);

            createMap();
            drawEverything();
    }

    function createMap(){
        columns = Math.floor(canvas.width / cellSize);
        rows = Math.floor(canvas.height / cellSize);

        for (var i=0;i<columns;i++){
            var row = [];
            gx = i * cellSize;
            for(var j=0;j<rows;j++){
                gy = j * cellSize;
                cell = new gridCell(gx, gy);
                row.push(cell);
            }
            cells.push(row);
        }

        //Configure each cell with neighbors
        for (x=0;x<cells.length;x++){
            for(y=0;y<cells[x].length;y++){
                if (between(y - 1, 0, cells[x].length - 1)){
                    cells[x][y].north = cells[x][y - 1];
                }
                if (between(y + 1, 0, cells[x].length - 1)){
                    cells[x][y].south = cells[x][y + 1];
                }
                if (between(x + 1, 0, cells.length - 1)){
                    cells[x][y].east = cells[x + 1][y];
                }
                if (between(x - 1, 0, cells.length - 1)){
                    cells[x][y].west = cells[x - 1][y];
                }
            }
        }
        
        currentCell = cells[19][14];

        binaryTree();

        for (i=0;i<columns;i++){
            for(j=0;j<rows;j++){
                cells[i][j].configure();
            }
        }
    }

    function keyPress(key){
		if (hasWon){
			return;
		}
        switch(key.which){
            case 37:
            case 97: //a
                    movePlayerWest();
                    break;
            case 38:	
            case 119: //w
                    movePlayerNorth();
                    break;
            case 40:
            case 115: //s
                    movePlayerSouth();
                    break;
            case 39:
            case 100: //d
                    movePlayerEast();
                    break;
        }
        moveGame();
        drawEverything();
    }

    //
    // DRAW DRAW DRAW
    //

    function drawEverything(){
        drawBackground();
        drawMap();
        drawPlayer();
    }

    function drawBackground(){
        canvasContext.fillStyle = 'pink';
        canvasContext.fillRect(0,0, canvas.width, canvas.height);
    }

    function drawMap(){
        //Draw each cell
        for (var i=0;i<cells.length;i++){
            for(var j=0;j<cells[i].length;j++){
                cells[i][j].draw(canvasContext);
            }
        }

		//Draw success square
        canvasContext.fillStyle = 'black';
		canvasContext.font = "9px Helvetica";
		canvasContext.fillText("END", cells[0][14].x + 10, cells[0][14].y + 25);
	
    }
            
    function drawPlayer(){
        canvasContext.fillStyle = 'white';
        //canvasContext.fillRect(currentCell.x + cellSize/2 - ps/2, currentCell.y + cellSize/2 - ps/2, pd, pd);
        canvasContext.fillRect(currentCell.x + cellSize/2 - pd/2, currentCell.y + cellSize/2 - pd/2, pd, pd);
    }

    //
    // MOVEMENT
    //

    function canMoveToCell(from, direction){
        switch(direction){
            case 'north':
                if (from.north == null){
                    return false;
                }
                if (containsObject(from.north, from.links)){
                    return true;
                }
                break;
            case 'south':
                if (from.south == null){
                    return false;
                }
                if (containsObject(from.south, from.links)){
                    return true;
                }
                break;
            case 'east':
                if (from.east == null){
                    return false;
                }
                if (containsObject(from.east, from.links)){
                    return true;
                }
                break;
            case 'west':
                if (from.west == null){
                    return false;
                }
                if (containsObject(from.west, from.links)){
                    return true;
                }
                break;
        }

        return false;
    }

    function movePlayerWest(){
        if (!canMoveToCell(currentCell, 'west')){
            return false;
        }
        currentCell = currentCell.west;
    }
    function movePlayerEast(){
        if (!canMoveToCell(currentCell, 'east')){
            return false;
        }
        currentCell = currentCell.east;
    }
    function movePlayerNorth(){
        if (!canMoveToCell(currentCell, 'north')){
            return false;
        }
        currentCell = currentCell.north;
    }
    function movePlayerSouth(){
        if (!canMoveToCell(currentCell, 'south')){
            return false;
        }
        currentCell = currentCell.south;
    }

    function moveGame(){
        if (currentCell == cells[0][14]){
			showSubstack();
			hasWon = true;
        }
    }

    //
    // CLASS-LIKE THINGS
    //

    function gridCell(x, y){
        this.x = x;
        this.y = y;
        this.north = null;
        this.south = null;
        this.east = null;
        this.west = null;
        this.links = [];

        this.canNorth = false;
        this.canSouth = false;
        this.canEast = false;
        this.canWest = false;

        this.configure = function(){
            if (this.links.length == 0){
                return;
            }

            if (containsObject(this.north, this.links)){
                this.canNorth = true;
            }
            if (containsObject(this.south, this.links)){
                this.canSouth = true;
            }
            if (containsObject(this.east, this.links)){
                this.canEast = true;
            }
            if (containsObject(this.west, this.links)){
                this.canWest = true;
            }
        }

        this.draw = function(ctx) {
            ctx.fillStyle = 'pink';
            ctx.fillRect(this.x + wallThickness, this.y + wallThickness, cellSize - wallThickness * 2, cellSize - wallThickness * 2);

            //north
            if (this.canNorth){
                ctx.fillStyle = 'pink';
				ctx.fillRect(this.x + 10, this.y, cellSize - 20, wallThickness);
            }else{
            	ctx.fillStyle = 'green';
	    		ctx.fillRect(this.x, this.y, cellSize, wallThickness);
	    	}

            //west
            if (this.canWest){
                ctx.fillStyle = 'pink';
				ctx.fillRect(this.x, this.y + 10, wallThickness, cellSize - 20);
			}else{
				ctx.fillStyle = 'white';
				ctx.fillRect(this.x, this.y, wallThickness, cellSize);
	    	}
            
            //east
            if (this.canEast){
                ctx.fillStyle = 'pink';
				ctx.fillRect(this.x + cellSize - wallThickness, this.y + 10, wallThickness, cellSize - 20);
            }else{
				ctx.fillStyle = 'teal';
				ctx.fillRect(this.x + cellSize - wallThickness, this.y, wallThickness, cellSize);
	    	}


            //south
			if (this.canSouth){
				ctx.fillStyle = 'pink';
				ctx.fillRect(this.x + 10, this.y + cellSize - wallThickness, cellSize - 20, wallThickness);
			}else{
				ctx.fillStyle = 'white';
				ctx.fillRect(this.x, this.y + cellSize - wallThickness, cellSize, wallThickness);
			}
		}

        this.link = function(cell){
            this.links.push(cell);
        }
    }

    // MAP ALGO
    function binaryTree(){
        var i = 0;
        var j = 0;
        var NORTH = 0;
        var EAST = 1;
        for(i=0;i<cells.length;i++){
            for(j=0;j<cells[i].length;j++){
                vcell = cells[i][j];
                if (vcell.north === null && vcell.east !== null){
                    carveEast(vcell);
                }else if (vcell.north !== null && vcell.east == null){
                    carveNorth(vcell);
                } else if (vcell.north === null && vcell.east === null){
                    //do nothing
                } else {
                    flip = Math.floor(Math.random() * 2);
                    
                    if(flip == NORTH){
                        carveNorth(vcell);
                    }else if(flip == EAST){
                        carveEast(vcell);
                    }
                }
            }
        }
    }

    function carveNorth(vcell){
        vcell.link(vcell.north);
        vcell.north.link(vcell);
    }

    function carveEast(vcell){
        vcell.link(vcell.east);
        vcell.east.link(vcell);
    }

    // UTILITY STUFF
    function between(x, min, max) {
        return x >= min && x <= max;
    }

    function containsObject(obj, list) {
        if (list.length == 0){
            return false;
        }
        if (obj === null){
            return false;
        }
        var i = 0;
        for (i=0; i<list.length;i++) {
            if (list[i] === obj) {
                return true;
            }
        }
        return false;
    }

    //PAGE STUFF
    function showSubstack(){
        var success = document.getElementById("subscribe");
        success.style.display = "block";
    }

	//THANK YOU FOR READING
