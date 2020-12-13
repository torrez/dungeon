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
     */

    //TODO copy over the algo from game2
    //TODO draw corridor cells with gray edges
    //TODO verify prim algo can work around rooms
    //TODO lay out more rooms

    let canvas;
    let canvasContext;
    let cells = [];
    let doors = [];
    let rooms = [];
    let rows, columns = 0;
    let roomsPlacedCount = 0;
    
    const cellSize = 20;
    const roomAttempts = 1;
    const roomMinSize = 4;
    const roomMaxSize = 6;

    window.onload = function(){
        canvas = document.getElementById('game');
        canvasContext = canvas.getContext('2d');

        columns = Math.floor(canvas.width / cellSize);
        rows = Math.floor(canvas.height / cellSize);

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


        //Place non-overlapping rooms of various sizes.
        for(let i=0;i<roomAttempts;i++){
            placeRoom();
        }

        //Fill up the empty space with corridors
        fillCorridors();

        //Trim excess corridors so it's not messy
        trimCorridors();

        //Add at least one door to room/corridor spots
        addDoors();
    }

    function placeRoom(){
        let randomPoint = [Math.floor(Math.random() * columns), Math.floor(Math.random() * rows)];
        let randomWidth = roomMinSize + Math.floor(Math.random()  * (roomMaxSize - roomMinSize));
        let randomHeight = roomMinSize + Math.floor(Math.random()  * (roomMaxSize - roomMinSize));

        if (randomPoint % 2 == 0){
            return;
        }
        //Does room fit on map?
        if((randomPoint[0] + randomWidth - 1 < columns) && 
            (randomPoint[1] + randomHeight - 1 < rows)){

            //Does it overlap with any other room?

            topLeft = randomPoint;
            bottomRight = [randomPoint[0]+randomWidth - 1, randomPoint[1] + randomHeight - 1];
            
            //for (let i=0;i<rooms.length;i++){

            //    if (rectanglesOverlap([randomPoint[0])){
            //        return;
            //    }
            //}

            //Add this room to our room list.
            //rows.push([topLeft, bottomRight]);

            //Create the room in our cells.
            for(let i=randomPoint[0];i<randomPoint[0] + randomWidth;i++){
                for(let j=randomPoint[1];j<randomPoint[1] + randomHeight;j++){
                    cells[i][j].type = 'room';
                }
            }
        }
    }

    function fillCorridors(){

    }

    function trimCorridors(){

    }

    function addDoors(){

    }

    function drawEverything(){
        drawBackground();
        drawCells();
        drawPlayer();
        drawDoors();
    }

    function drawBackground(){
        canvasContext.fillStyle = 'black';
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);
    }

    function drawCells(){
        for(var i=0;i<columns;i++){
            for(var j=0;j<rows;j++){
                cells[i][j].draw();
            }
        }
    }
    
    function drawPlayer(){

    }

    function drawDoors(){

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

        this.draw = function(){
            if (this.type == 'room'){
                canvasContext.fillStyle = 'black';
                canvasContext.fillRect(this.x, this.y, cellSize, cellSize);
            }else{
                canvasContext.fillStyle = 'gray';
                canvasContext.fillRect(this.x + 1, this.y + 1, cellSize - 2, cellSize - 2);
            }
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
    
