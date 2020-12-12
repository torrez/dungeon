    /*
     * This one was fun because I had a chance to rewrite everything and improve things
     * a bit. I also had a chance to do a much more interesting maze algorithm called Prim's
     * Alrgorithm.
     *
     * The first time I implemented it I had a bug where it was biased toward selecting only
     * north/south paths, so the maze looked like a very confusing parking lot or some kind
     * of demented game of tennis.
     *
     * Because of that I started with teal for the background and then 
     * 
     * Also since I am literally learning JavaScript as I do this, I discovered the set()
     * function which solved a bunch of problems I was having in the first iteration of this
     * game and let me get rid of some utility functions that set() takes care of.
     *
     */
    var canvas;
    var canvasContext;
    var cells = [];
    var cellSize = 40;
    var columns, rows = 0;
    var currentCell = {};
    var playerSize = 15;
    var playerColor = 'gold';
    var wallThickness = 2;
    var mazeColor = 'teal';
    var mazeColorList = ['teal', 'purple', 'blue', 'black'];
    var rightTopCorner;
    var rightBottomCorner;
    var leftBottomCorner;
    var stage = 1;
    var hasWon = false;

    window.onload = function(){
        canvas = document.getElementById('game');
        canvasContext = canvas.getContext('2d');
        document.addEventListener('keypress', keyPress);
        document.addEventListener('keydown', keyPress);

        columns = Math.floor(canvas.width / cellSize);
        rows = Math.floor(canvas.height / cellSize);

        createMaze();
        drawEverything();
    }


    function mapCell(x, y){
        this.x = x;
        this.y = y;
        this.north = null;
        this.south = null;
        this.east = null;
        this.west = null;
        this.links = new Set();

        this.configure = function(){
            if (this.links.size == 0){
                return;
            }
        }

        this.draw = function(ctx){
            ctx.fillStyle = mazeColor;
            ctx.fillRect(this.x, this.y, cellSize, cellSize);

            //north
            if (this.links.has(this.north)){
                ctx.fillStyle = mazeColor;
				ctx.fillRect(this.x + wallThickness, this.y, cellSize - wallThickness * 2, wallThickness);
            }else{
            	ctx.fillStyle = 'white';
	    		ctx.fillRect(this.x, this.y, cellSize, wallThickness);
	    	}

            //west
            if (this.links.has(this.west)){
                ctx.fillStyle = mazeColor;
				ctx.fillRect(this.x, this.y + 10, wallThickness, cellSize - 20);
			}else{
				ctx.fillStyle = 'white';
				ctx.fillRect(this.x, this.y, wallThickness, cellSize);
	    	}
            
            //east
            if (this.links.has(this.east)){
                ctx.fillStyle = mazeColor;
				ctx.fillRect(this.x + cellSize - wallThickness, this.y + wallThickness, wallThickness, cellSize - wallThickness*2);
            }else{
				ctx.fillStyle = 'white';
				ctx.fillRect(this.x + cellSize - wallThickness, this.y, wallThickness, cellSize);
	    	}


            //south
			if (this.links.has(this.south)){
				ctx.fillStyle = mazeColor;
				ctx.fillRect(this.x + wallThickness, this.y + cellSize - wallThickness, cellSize - wallThickness*2, wallThickness);
			}else{
				ctx.fillStyle = 'white';
				ctx.fillRect(this.x, this.y + cellSize - wallThickness, cellSize, wallThickness);
			}
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

    function createMaze(){
        for(var i=0;i<columns;i++){
            var row = [];
            gx = i * cellSize;
            for(var j=0;j<rows;j++){
                gy = j * cellSize;
                cell = new mapCell(gx, gy);
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

        rightTopCorner = cells[cells.length - 1][0];
        rightBottomCorner = cells[cells.length - 1][cells[0].length - 1];
        leftBottomCorner = cells[0][cells[0].length - 1];
        primsAlgo();
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
            current.draw(canvasContext);
            await new Promise(r => setTimeout(r, 1)); //I guess? Yuck.
            drawEverything();

            frontierCells.delete(current);

            //Remove the wall between the current cell and a random adjacent
            //cell that belongs to the visited set.
            neighbor = randomVisitedNeighbor(current, visitedCells);
            if (neighbor){
                current.link(neighbor);
                neighbor.link(current);
            }else{
                console.log("ran out of neighbors");
            }
        } while (frontierCells.size > 0);
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

    function drawEverything(){
        drawCells();
        drawGoals();
        drawPlayer();
    }

    function drawCells(){
        for(var i=0;i<columns;i++){
            for(var j=0;j<rows;j++){
                cells[i][j].draw(canvasContext);
            }
        }
    }

    function drawPlayer(){
        canvasContext.fillStyle = playerColor;
        centerOfCell = cellSize / 2;
        centerOfPlayer = playerSize / 2;
        canvasContext.fillRect(currentCell.x + centerOfCell - centerOfPlayer, currentCell.y + centerOfCell - centerOfPlayer, playerSize, playerSize);
    }

    function drawGoals(){
        canvasContext.fillStyle = 'white';
        canvasContext.font = '12px Helvetica';
        canvasContext.fillText("1", cells[0][0].x + cellSize/2 - 1, cells[0][0].y + cellSize/2 + 1);

        canvasContext.fillStyle = 'white';
        canvasContext.font = '12px Helvetica';
        canvasContext.fillText("2", rightTopCorner.x + cellSize/2 - 1, rightTopCorner.y + cellSize/2 + 1);

        canvasContext.fillStyle = 'white';
        canvasContext.font = '12px Helvetica';
        canvasContext.fillText("3", rightBottomCorner.x + cellSize/2 - 1, rightBottomCorner.y + cellSize/2 + 1);

        canvasContext.fillStyle = 'white';
        canvasContext.font = '12px Helvetica';
        canvasContext.fillText("end", leftBottomCorner.x + cellSize/2 - 8, leftBottomCorner.y + cellSize/2 + 1);
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
        }

        drawEverything();
    }

    function movePlayer(direction){
        if (hasWon){
            return false;
        }
        if (!canMoveToCell(currentCell, direction)){
            return false;
        }
        currentCell = currentCell[direction];

        if (currentCell == rightTopCorner && stage == 1){
            mazeColor = mazeColorList[1];
            stage = 2;
        } else if(currentCell == rightBottomCorner && stage == 2){
            mazeColor = mazeColorList[2];
            stage = 3;
        } else if(currentCell == leftBottomCorner && stage == 3){
            mazeColor = mazeColorList[3];
            stage = 4;
            hasWon = true;
            var success = document.getElementById("subscribe");
            success.style.display = "block";
        }
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

    //THANKS FOR READING!
