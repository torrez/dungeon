    var canvas;
    var canvasContext;
    var cells = [];
    var cellSize = 40;
    var columns, rows = 0;
    var currentCell = {};
    var playerSize = 5;
    var wallThickness = 5;

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
            ctx.fillStyle = 'teal';
            ctx.fillRect(this.x, this.y, cellSize, cellSize);

            //north
            if (this.links.has(this.north)){
                ctx.fillStyle = 'pink';
				ctx.fillRect(this.x + 10, this.y, cellSize - 20, wallThickness);
            }else{
            	ctx.fillStyle = 'green';
	    		ctx.fillRect(this.x, this.y, cellSize, wallThickness);
	    	}

            //west
            if (this.links.has(this.west)){
                ctx.fillStyle = 'pink';
				ctx.fillRect(this.x, this.y + 10, wallThickness, cellSize - 20);
			}else{
				ctx.fillStyle = 'white';
				ctx.fillRect(this.x, this.y, wallThickness, cellSize);
	    	}
            
            //east
            if (this.links.has(this.east)){
                ctx.fillStyle = 'pink';
				ctx.fillRect(this.x + cellSize - wallThickness, this.y + 10, wallThickness, cellSize - 20);
            }else{
				ctx.fillStyle = 'teal';
				ctx.fillRect(this.x + cellSize - wallThickness, this.y, wallThickness, cellSize);
	    	}


            //south
			if (this.links.has(this.south)){
				ctx.fillStyle = 'pink';
				ctx.fillRect(this.x + 10, this.y + cellSize - wallThickness, cellSize - 20, wallThickness);
			}else{
				ctx.fillStyle = 'white';
				ctx.fillRect(this.x, this.y + cellSize - wallThickness, cellSize, wallThickness);
			}
        }

        this.link = function(cell){
            this.links.add(cell);
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

        binaryTree();
    }

    function binaryTree(){
        var i = 0;
        var j = 0;
        var NORTH = 0;
        var EAST = 1;
        for(i=0;i<cells.length;i++){
            for(j=0;j<cells[i].length;j++){
                vcell = cells[i][j];
                if (vcell.north === null && vcell.east !== null){
                    carvePath(vcell, 'east');
                }else if (vcell.north !== null && vcell.east == null){
                    carvePath(vcell, 'north');
                } else if (vcell.north === null && vcell.east === null){
                    //do nothing
                } else {
                    flip = Math.floor(Math.random() * 2);
                    
                    if(flip == NORTH){
                        carvePath(vcell, 'north');
                    }else if(flip == EAST){
                        carvePath(vcell, 'east');
                    }
                }
            }
        }
    }

    function carvePath(vcell, direction){
        vcell.link(vcell[direction]);
        vcell[direction].link(vcell);
    }

    function drawEverything(){
        drawCells();
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
        canvasContext.fillStyle = 'white';
        canvasContext.fillRect(currentCell.x, currentCell.y, playerSize, playerSize);
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
