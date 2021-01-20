    'use strict';

    let canvas;
    let ctx;
    let columns, rows = 0;
    let currentCell
    let rightBottomCorner;
    let cells = [];
    let hasWon = false;
    let torches = 4;
    let mazeColor = 'black';
    let wallColor = 'black';
    let stepsLeft;


    const cellSize = 30;
    const playerSize = 10;
    const wallThickness = 1;
    const playerColor = 'yellow';
    const torchSteps = 20;

    window.onload = function(){
        canvas = document.getElementById('game');
        ctx = canvas.getContext('2d');

		setUp();
    }

    function setUp(){
        columns = Math.floor(canvas.width / cellSize);
        rows = Math.floor(canvas.height / cellSize);

        stepsLeft = 0;

        document.addEventListener("keydown", keyPress);
        document.addEventListener("keypress", keyPress);

        document.getElementById('torch-count').innerText = torches + " torches";

        createMaze();
        drawEverything();
    }

        
    function keyPress(key){
        switch(key.which){
            case 37:
            case 97:
                movePlayer('west');
                break;

            case 38:	
            case 119:
                movePlayer('north');
                break;

            case 39:
            case 100:
                movePlayer('east');
                break;

            case 40:
            case 115:
                movePlayer('south');
                break;

            case 84:
                lightTorch();
                break;
        }

        drawEverything();
    }

    function lightTorch(){
        if(hasWon){
            return;
        }
        if (torches > 0){
            torches-=1;
            updateTorches();
            stepsLeft = torchSteps;
            drawEverything();
        }
    }

    function updateTorches(){
        let torch_string = torches;
        if (torches == 1){
            torch_string += " torch";
        }else{
            torch_string += " torches";
        }
        document.getElementById('torch-count').innerText = torch_string;
    }

    function movePlayer(direction){
        if (hasWon){
            return false;
        }

        if (!canMoveToCell(currentCell, direction)){
            return false;
        }

        stepsLeft-= 1;

        currentCell = currentCell[direction];

        if(currentCell == rightBottomCorner){
            hasWon = true;
            var success = document.getElementById("subscribe");
            success.style.display = "block";
            mazeColor = 'white';
            wallColor = 'black';
            drawPlayer();
        }
    }

    function createMaze(){
        let gx = 0;
        let gy = 0;

        for(var i=0;i<columns;i++){
            var row = [];
            gx = i * cellSize;
            for(var j=0;j<rows;j++){
                gy = j * cellSize;
                let cell = new mapCell(gx, gy);
                row.push(cell);
            }
            cells.push(row);
        }

        //Configure each cell with neighbors
        for (var x=0;x<cells.length;x++){
            for(var y=0;y<cells[x].length;y++){
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
        
        //place player
        currentCell = cells[0][0];
        rightBottomCorner = cells[cells.length - 1][cells[0].length - 1];
        currentCell = cells[cells.length - 2][cells[0].length - 2];
        primsAlgo();
    }

    function mapCell(x, y){
        this.x = x;
        this.y = y;
        this.north = null;
        this.south = null;
        this.east = null;
        this.west = null;
        this.links = new Set();

        this.draw = function(ctx){
            let originalMazeColor = mazeColor;
            let originalWallColor = wallColor;

            //Not great. ;)
            if((stepsLeft > 0) && (
                this.north == currentCell ||
                this.south == currentCell ||
                this.west == currentCell ||
                this.east == currentCell ||
                this.north?.west == currentCell ||
                this.north?.east == currentCell ||
                this.south?.west == currentCell ||
                this.south?.east == currentCell ||
                this.north?.north == currentCell ||
                this.south?.south == currentCell ||
                this.west?.west == currentCell ||
                this.east?.east == currentCell ||
                this == currentCell)){
                mazeColor = 'black';
                wallColor = 'grey';
            }
                

            ctx.fillStyle = mazeColor;
            ctx.fillRect(this.x, this.y, cellSize, cellSize);
           


            //north
            if (this.links.has(this.north)){
                ctx.fillStyle = mazeColor;
				ctx.fillRect(this.x + wallThickness, this.y, cellSize - wallThickness * 2, wallThickness);
            }else{
            	ctx.fillStyle = wallColor;
	    		ctx.fillRect(this.x, this.y, cellSize, wallThickness);
	    	}

            //west
            if (this.links.has(this.west)){
                ctx.fillStyle = mazeColor;
				ctx.fillRect(this.x, this.y + 10, wallThickness, cellSize - 20);
			}else{
				ctx.fillStyle = wallColor;
				ctx.fillRect(this.x, this.y, wallThickness, cellSize);
	    	}
            
            //east
            if (this.links.has(this.east)){
                ctx.fillStyle = mazeColor;
				ctx.fillRect(this.x + cellSize - wallThickness, this.y + wallThickness, wallThickness, cellSize - wallThickness*2);
            }else{
				ctx.fillStyle = wallColor;
				ctx.fillRect(this.x + cellSize - wallThickness, this.y, wallThickness, cellSize);
	    	}


            //south
			if (this.links.has(this.south)){
				ctx.fillStyle = mazeColor;
				ctx.fillRect(this.x + wallThickness, this.y + cellSize - wallThickness, cellSize - wallThickness*2, wallThickness);
			}else{
				ctx.fillStyle = wallColor;
				ctx.fillRect(this.x, this.y + cellSize - wallThickness, cellSize, wallThickness);
			}

            mazeColor = originalMazeColor;
            wallColor = originalWallColor;
        }

        this.link = function(cell){
            this.links.add(cell);
        }

        this.neighbors = function(){
            var dirs = ['north', 'south', 'east', 'west'];
            var neighbs = [];
            for (var i=0;i<4;i++){
                if (this[dirs[i]] !== null){
                    neighbs.push(this[dirs[i]]);
                }
            }
            return neighbs;
        }
    }

    async function primsAlgo(){
        //Choose a random cell as the starting point, and add it to the visited set.
        var current = randomCell();
        var visitedCells = new Set();
        var frontierCells = new Set();

        do {
            //Add all unvisited cells that are adjacent to the current cell to the frontier set.
            visitedCells.add(current);
            var neighbors = current.neighbors();
            for(var i=0;i<neighbors.length;i++){
                if(!visitedCells.has(neighbors[i])){
                    frontierCells.add(neighbors[i]);
                }
            }

            //Choose a cell randomly from the frontier set and make it the current cell,
            //removing it from the frontier set and adding it to the visited set.
            let items = Array.from(frontierCells);
            current = items[Math.floor(Math.random() * items.length)];

            //You know, for fun
            //current.draw(ctx);

            frontierCells.delete(current);

            //Remove the wall between the current cell and a random adjacent
            //cell that belongs to the visited set.
            let neighbor = randomVisitedNeighbor(current, visitedCells);
            if (neighbor){
                current.link(neighbor);
                neighbor.link(current);
            }else{
                console.log("ran out of neighbors");
            }
        } while (frontierCells.size > 0);

		drawEverything();
    }

    function drawEverything(){
        drawCells();
        drawGoals();
        drawPlayer();
    }

    function drawCells(){
        for(var i=0;i<columns;i++){
            for(var j=0;j<rows;j++){
                cells[i][j].draw(ctx);
            }
        }
    }

    function drawPlayer(){
        let centerOfCell = cellSize / 2;
        let centerOfPlayer = playerSize / 2;
        if(hasWon){
            ctx.fillStyle = 'green';
        }else{
            ctx.fillStyle = playerColor;
        }
        ctx.fillRect(currentCell.x + centerOfCell - centerOfPlayer, currentCell.y + centerOfCell - centerOfPlayer, playerSize, playerSize);
    }

    function drawGoals(){
        ctx.fillStyle = 'white';
        ctx.font = '12px Helvetica';
        ctx.fillText("exit", rightBottomCorner.x + 3, rightBottomCorner.y + cellSize/2 + 1);
    }

    function randomVisitedNeighbor(current, vCells){
        var neighbors = current.neighbors();
        var visitedNeighbors = [];

        for(var i=0;i<neighbors.length;i++){
            if(vCells.has(neighbors[i])){
                visitedNeighbors.push(neighbors[i]);
            }
        }

        if(visitedNeighbors.length == 0){
            return false;
        }else{
            return visitedNeighbors[Math.floor(Math.random() * visitedNeighbors.length)]
        }
    }


    function randomCell(){
        var random_row = Math.floor(Math.random() * rows);
        var random_column = Math.floor(Math.random() * columns);
        return cells[random_column][random_row];
    }

    function carvePath(vcell, direction){
        vcell.link(vcell[direction]);
        vcell[direction].link(vcell);
    }

    function canMoveToCell(from, direction){
        if (from[direction] == null){
            return false;
        }

        if(from.links.has(from[direction])){
            return true;
        }

        return false;
    }


    function between(x, min, max) {
        return x >= min && x <= max;
    }
