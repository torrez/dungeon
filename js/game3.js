    /*
     * This one is based on Bob Nystrom's post about procedural dungeon generators:
     * https://journal.stuffwithstuff.com/2014/12/21/rooms-and-mazes/
     * 
     * Back in college in the early 90's, while avoiding homework, I started poking
     * around the shared Unix machine we'd use to do our work on. Somehow I saw
     * a program with an intriguing name:
     *
     * `nethack`
     *
     * I absolutely the remember that first time I ran it and then played for hours, not
     * finishing my homework.
     *
     * Anyway, this type of maze I've always wanted to make. So this is my first stab
     * at it. Didn't actually read any of his code, just that post linked above, and
     * I watched the animations. Seems easy right?
     *
     * I think my tunnels are a little too twisty and I can't decide if I like the
     * number of rooms it's generating, but I feel like I got a pretty good handle
     * on what I want it to be and can remake it if I want.
     *
     * Please save these files and tweak the constants for fun!
     */

    let canvas;
    let canvasContext;
    let cells = [];
    let doors = [];
    let rooms = [];
    let rows, columns = 0;
    let roomsPlacedCount = 0;
    let currentCell = {};
    let hasWon = false;
	let score = 0;
	let totalGold = 0;
    
    const cellSize = 20;
    const playerSize = cellSize - 6;
    const roomAttempts = 50;
    const roomMinSize = 2;
    const roomMaxSize = 8;
    const maxRooms = 12;
    const wallThickness = 1;
    const mazeColor = 'black';
    const roomColor = '#333';
    const playerColor = 'white';
    const emptySpaceColor = 'black';
    const corridorTrimmingRounds = 15;
    const maxDoors = 2;


    window.onload = function(){
        canvas = document.getElementById('game');
        canvasContext = canvas.getContext('2d');

        columns = Math.floor(canvas.width / cellSize);
        rows = Math.floor(canvas.height / cellSize);

        document.addEventListener('keypress', keyPress);
        document.addEventListener('keydown', keyPress);

        makeLevel();
        drawEverything();
    }

    function makeLevel(){
        for(let i=0;i<columns;i++){
            let row = [];
            gx = i * cellSize;
            for(let j=0;j<rows;j++){
                gy = j * cellSize;
                cell = new mazeCell(gx, gy);
                row.push(cell);
            }
            cells.push(row);
        }

        //Configure each cell with neighbors
        for (var x=0;x<cells.length;x++){
            for(var y=0;y<cells[x].length;y++){
                if (between(y - 1, 0, cells[x].length - 1)){
                    if (cells[x][y - 1] != null && cells[x][y - 1].type != 'room'){
                        cells[x][y].north = cells[x][y - 1];
                    }
                }
                if (between(y + 1, 0, cells[x].length - 1)){
                    if (cells[x][y + 1] != null && cells[x][y + 1].type != 'room'){
                        cells[x][y].south = cells[x][y + 1];
                    }
                }
                if (between(x + 1, 0, cells.length - 1)){
                    if (cells[x + 1][y] != null && cells[x + 1][y].type != 'room'){
                        cells[x][y].east = cells[x + 1][y];
                    }
                }
                if (between(x - 1, 0, cells.length - 1)){
                    if (cells[x - 1][y] != null && cells[x - 1][y].type != 'room'){
                        cells[x][y].west = cells[x - 1][y];
                    }
                }
            }
        }

        //Place non-overlapping rooms of various sizes.
        let totalRoomsPlaced = 0;
        for(let i=0;i<roomAttempts;i++){
            let success =  placeRoom();
            if (success){
                totalRoomsPlaced++;
                if (totalRoomsPlaced == maxRooms){
                    break;
                }
            }
        }

        //find all rooms and link them to neighbors;
        linkRoomCells();

        //Fill up the empty space with corridors
        fillCorridors();

        //Trim excess corridors so it's not messy
        trimCorridors();

        //Add at least one door to room/corridor spots
        addDoors();

        //places the player in a room and lights it up
        addPlayer();

        //places some gold in every room
        addGold();
    }

    function placeRoom(){
        let randomPoint = [Math.floor(Math.random() * columns), Math.floor(Math.random() * rows)];
        let randomWidth = roomMinSize + Math.floor(Math.random()  * (roomMaxSize - roomMinSize));
        let randomHeight = roomMinSize + Math.floor(Math.random()  * (roomMaxSize - roomMinSize));

        if (randomPoint % 2 == 0){
            return false;
        }

        //Does room fit on map?
        if((randomPoint[0] + randomWidth - 1 < columns) && 
            (randomPoint[1] + randomHeight - 1 < rows)){

            //Does it overlap with any other room?
            topLeft = randomPoint;
            bottomRight = [randomPoint[0]+randomWidth - 1, randomPoint[1] + randomHeight - 1];
            
            for (let i=0;i<rooms.length;i++){
                let roomTestTL = rooms[i].topLeft();
                let roomTestBR = rooms[i].bottomRight();

                if (rectanglesOverlap(topLeft, bottomRight, [roomTestTL.x, roomTestTL.y], [roomTestBR.x, roomTestBR.y])){
                    return false;
                }
            }

            //Add this room to our room list.
            newRoom = new room(topLeft[0], topLeft[1], randomWidth, randomHeight);
            rooms.push(newRoom);

            //Assign room in our cells.
            for(let i=randomPoint[0];i<randomPoint[0] + randomWidth;i++){
                for(let j=randomPoint[1];j<randomPoint[1] + randomHeight;j++){
                    cells[i][j].type = 'room';
                    cells[i][j].room = newRoom;
                }
            }
            return true;
        }
        return false;
    }


    function linkRoomCells(){
        for (let i=0;i<cells.length;i++){
            for (let j=0;j<cells[i].length;j++){
                if (cells[i][j].type == 'room'){
                    let neighbors = cells[i][j].neighbors('');
                    for(let k=0;k<neighbors.length;k++){
                        if(neighbors[k].type == 'room'){
                            neighbors[k].link(cells[i][j]);
                            cells[i][j].link(neighbors[k]);
                        }
                    }
                }
            }
        }
    }

    function fillCorridors(){
        floodAlgo();
    }


	/* Too many corridors leading to nowhere would
	 * be a bummer so let's find any cell with only
	 * one linked path and remove it.
	 *
	 */
    function trimCorridors(){
        for(let k=0;k<corridorTrimmingRounds;k++){
            for(let i=0;i<columns;i++){
                for(let j=0;j<rows;j++){
                    if(cells[i][j].type == 'path'){
                        if(cells[i][j].link_count() == 1){
                            cells[i][j].unlinkAll();
                            cells[i][j].type = '';
                        }
                    }
                }
            }
        }
    }

    function addDoors(){
        for (let i=0;i<rooms.length;i++){
            let edges = rooms[i].edges();
            let doorsPlaced = 0;

            for (let j=0;j<edges.length;j++){
                let edge = edges[j];
                let thisCell = cells[edge[0]][edge[1]];
                thisCell.isEdge = true;
                neighbors = thisCell.neighbors();
                for (let k=0;k<neighbors.length;k++){
                    if(neighbors[k].type == 'path' && doorsPlaced < maxDoors){
                        thisCell.link(neighbors[k]);
                        neighbors[k].link(thisCell);
                        doorsPlaced++;
						rooms[i].hasDoors = true;
                    }
                }
            }
        }
    }

	/* We don't want to place the player
	 * in a room that doesn't have a door
	 */
    function addPlayer(){
        let placedPlayer = false;
        let roomAttempt = 0;
        while(!placedPlayer){
            let tryRoom = rooms[roomAttempt];
			if (tryRoom.hasDoors){
				let startingCell = cells[tryRoom.x][tryRoom.y];
				currentCell = startingCell;
				currentCell.room.lightRoom();
				placedPlayer = true;
			}
			roomAttempt++;
        }
    }

	/*
	 * Only drop gold into rooms that have doors.
	 */
    function addGold(){
		for(let i=0;i<rooms.length;i++){
			if (rooms[i].hasDoors){
				rooms[i].dropGold();
				totalGold++;
			}
		}
    }


    function drawEverything(){
        drawBackground();
        drawCells();
        drawDoors();
        drawPlayer();
    }

    function drawBackground(){
        canvasContext.fillStyle = 'black';
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);
    }

    function drawCells(){
        for(let i=0;i<columns;i++){
            for(let j=0;j<rows;j++){
                cells[i][j].draw();
            }
        }
    }

    function drawDoors(){
    }

    
    function drawPlayer(){
        canvasContext.fillStyle = playerColor;
        centerOfCell = cellSize / 2;
        centerOfPlayer = playerSize / 2;
        canvasContext.fillRect(currentCell.x + centerOfCell - centerOfPlayer, currentCell.y + centerOfCell - centerOfPlayer, playerSize, playerSize);
    }

    function mazeCell(x, y) {
        this.x = x;
        this.y = y;
        this.north = null;
        this.south = null;
        this.east = null;
        this.west = null;
        this.links = new Set();
        this.type = '';
        this.roomId = -1;
        this.isEdge = false;
        this.isLit = false;
		this.hasGold = false;

        this.draw = function(){
            if (!this.isLit){
                return;
            }
            if (this.type == 'room'){
                canvasContext.fillStyle = roomColor;
                canvasContext.fillRect(this.x, this.y, cellSize, cellSize);
                /*if (this.isEdge){
                    canvasContext.fillStyle = 'pink';
                    canvasContext.fillRect(this.x, this.y, cellSize, cellSize);
                }*/
				if (this.hasGold){
					canvasContext.fillStyle = 'gold';
					//canvasContext.fillRect(this.x + cellSize / 2, this.y + cellSize / 2, cellSize/4, cellSize/4);
					canvasContext.fillRect(this.x + cellSize/2, this.y + cellSize/2, cellSize/4, cellSize/4);
				}
            }else if(this.type == ''){
                canvasContext.fillStyle = emptySpaceColor;
                canvasContext.fillRect(this.x, this.y, cellSize, cellSize);
            }else{
                canvasContext.fillStyle = '#121';
                canvasContext.fillRect(this.x + 1, this.y + 1, cellSize - 2, cellSize - 2);
            
                //north
                if (this.links.has(this.north)){
                    canvasContext.fillStyle = mazeColor;
                    canvasContext.fillRect(this.x + wallThickness, this.y, cellSize - wallThickness * 2, wallThickness);
                }else{
                    canvasContext.fillStyle = 'white';
                    canvasContext.fillRect(this.x, this.y, cellSize, wallThickness);
                }

                //west
                if (this.links.has(this.west)){
                    canvasContext.fillStyle = mazeColor;
                    canvasContext.fillRect(this.x, this.y + 10, wallThickness, cellSize - 20);
                }else{
                    canvasContext.fillStyle = 'white';
                    canvasContext.fillRect(this.x, this.y, wallThickness, cellSize);
                }
                
                //east
                if (this.links.has(this.east)){
                    canvasContext.fillStyle = mazeColor;
                    canvasContext.fillRect(this.x + cellSize - wallThickness, this.y + wallThickness, wallThickness, cellSize - wallThickness*2);
                }else{
                    canvasContext.fillStyle = 'white';
                    canvasContext.fillRect(this.x + cellSize - wallThickness, this.y, wallThickness, cellSize);
                }


                //south
                if (this.links.has(this.south)){
                    canvasContext.fillStyle = mazeColor;
                    canvasContext.fillRect(this.x + wallThickness, this.y + cellSize - wallThickness, cellSize - wallThickness*2, wallThickness);
                }else{
                    canvasContext.fillStyle = 'white';
                    canvasContext.fillRect(this.x, this.y + cellSize - wallThickness, cellSize, wallThickness);
                }
            }
        }

        this.link = function(cell){
            this.links.add(cell);
        }

        this.unlink = function(cell){
            this.links.delete(cell);
            cell.links.delete(this);
        }

        this.unlinkAll = function(){
            while(this.links.size > 0){
                let aCell = [...this.links][0];
                this.unlink(aCell);
            }
        }

        this.link_count = function(){
            return this.links.size;
        }

        this.neighbors = function(exclude='room'){
            var dirs = ['north', 'south', 'east', 'west'];
            var neighbs = [];
            for (var i=0;i<4;i++){
                if (this[dirs[i]] !== null && this[dirs[i]].type != exclude){
                    neighbs.push(this[dirs[i]]);
                }
            }
            return neighbs;
        }


    }

    function room(x, y, width, height){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.hasDoor = false;

        this.topLeft = function(){
            return {'x':x, 'y':y};
        }

        this.bottomRight = function(){
            return {'x': this.x + this.width - 1, 'y':this.y + this.height - 1};
        }

        this.edges = function(){
            let tlx = this.x;
            let tly = this.y;
            let brx = this.bottomRight()['x'];
            let bry = this.bottomRight()['y'];

            let allPoints = [];
            
            //get the top and bottom
            for(let i = tlx;i<=brx;i++){
                allPoints.push([i, tly]);
                allPoints.push([i, bry]); 
            }

            //get the middle sides
            for(let i = tly + 1;i<bry;i++){
                allPoints.push([tlx, i]);
                allPoints.push([brx, i]);
            }

            return allPoints;
        }

		this.lightRoom = function(){
			for(let i=this.x;i<this.x+this.width;i++){
				for(let j=this.y;j<this.y+this.height;j++){
					cells[i][j].isLit = true;
				}
			}
		}

		this.dropGold = function(){
			let randomX = Math.floor(Math.random() * this.width);
			let randomY = Math.floor(Math.random() * this.height);
			cells[this.x + randomX][this.y + randomY].hasGold = true;
		}
    }

    function floodAlgo(){
        let activeCells = new Set();
        let visitedCells = new Set();
        let totalCells = Array.from(availableCells());
        let randomCell = totalCells[Math.floor(Math.random() * totalCells.length)];

        activeCells.add(randomCell);

        while(activeCells.size != 0 ){
            //let aCell = [...activeCells][Math.floor(Math.random() * activeCells.size)]
            let aCell = [...activeCells][activeCells.size - 1]
            aCell.type = 'path';
            let dir = ['north','north','north','south','south','south', 'west', 'east'];

            //if (activeCells.size % 2 == 0){
                shuffleArray(dir);
            //}
            
            let foundLink = false;
            
            for(let i = 0;i<dir.length;i++){
                if(aCell[dir[i]] != null && aCell[dir[i]].type != 'room' && !visitedCells.has(aCell[dir[i]])){
                    aCell.link(aCell[dir[i]]);
                    aCell[dir[i]].link(aCell);
                    activeCells.add(aCell[dir[i]]);
                    foundLink = true;
            //await new Promise(r => setTimeout(r, 1)); //I guess? Yuck.
            //drawEverything();
                    break;
                }
            }
            visitedCells.add(aCell);

            if (!foundLink){
                activeCells.delete(aCell);
            }
        }
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
        if (!canMoveToCell(currentCell, direction)){
            return false;
        }

        currentCell = currentCell[direction];
        currentCell.isLit = true;

        let neighbors = currentCell.neighbors('');
        for(let i=0;i<neighbors.length;i++){
            neighbors[i].isLit = true;
        }

        if (currentCell.type == 'room'){
			currentCell.room.lightRoom();
        }

		if (currentCell.hasGold){
			currentCell.hasGold = false;
			score+=1;
			updateScore();
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

    function availableCells(){
        let aCells = new Set();
        for (let i=0;i<cells.length;i++){
            for (let j=0;j<cells[i].length;j++){
                if (cells[i][j].type != 'room' && cells[i][j].type != 'path'){
                    aCells.add(cells[i][j]);
                }
            }
        }
        return aCells;

    }

	function updateScore(){
		scoreDiv = document.getElementById('score');
		scoreDiv.innerHTML = "Score: " + score + '/4';
		if(score > 3){
			let success = document.getElementById("subscribe");
			success.style.display = "block";
		}
	}

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    //Utility functions
    function between(x, min, max) {
        return x >= min && x <= max;
    }
        
    function rectanglesOverlap(topLeft1, bottomRight1, topLeft2, bottomRight2) {
        if (topLeft1[0] > bottomRight2[0] || topLeft2[0] > bottomRight1[0]) {
            return false;
        }
        if (topLeft1[1] > bottomRight2[1] || topLeft2[1] > bottomRight1[1]) {
            return false;
        }
        return true;
    }


    //Thank you for reading!
    
