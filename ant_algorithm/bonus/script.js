window.addEventListener("load", function onWindowLoad() {
    //---------------------------------Canvas---------------------------------
    let wallAndFoodCanvas = document.getElementById("canvas-map-wall-food"),
        wallAndFoodCtx = wallAndFoodCanvas.getContext('2d');

    let mapPheromoneCanvas = document.getElementById("canvas-map-pheromone"),
        mapPheromoneCtx = mapPheromoneCanvas.getContext('2d');

    let mapAntCanvas = document.getElementById("canvas-map-ant"),
        mapAntCtx = mapAntCanvas.getContext('2d');
        mapAntCtx.strokeStyle = "black";

    //---------------------global variables for animation---------------------

    let AnthillSize = 20;
    let AnthillColor = "red";

    //-----------------------------Global Variables---------------------------
    let Matrix;
    let Ants;
    let heuristicValue = 1.0;
    let alpha = 1.0;
    let beta = 1.0;

    let IsStartButton = false;
    let IsAntHillButton = false;
    let IsFoodButton = false;
    let IsWallButton = false;

    let SizeBrush = 5;

    const MaxFood = 32;

    //----------------------Initiate Global Variables-------------------------
    function initStartVar() {
        Matrix = new Array(wallAndFoodCanvas.width);
        for (let i = 0; i < wallAndFoodCanvas.width; i++) {
            Matrix[i] = new Array(wallAndFoodCanvas.height);
            for (let j = 0; j < wallAndFoodCanvas.height; j++) {
                Matrix[i][j] = {
                    HomePheromone: 0,
                    FoodPheromone: 0.1,
                    Food: 0,
                    IsWall: false,
                    IsAnthill: false,
                }
            }
        }
    }

    //-----------------------------Initialization-----------------------------
    initStartVar();

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }
      
      async function drawAnt(ant) {
        mapAntCtx.fillRect(ant.x, ant.y, 3, 3);
        await sleep(100);
      }
    //-----------------Map Building and Drawing Button-------------------------
    document.getElementById("start").onclick = function() 
    {
        while(1)
        {
            let kolvo = 0;
            for(let i = 0;i<30;i = 0)
            {
                kolvo+=1;
                let ant = Ants[i];
                let availableCells = new Array();
                let temp = 0;
                for(let j = ant.x-1;j<=ant.x+1;++j)
                {
                    for(let k = ant.y-1;k<=ant.y+1;++k)
                    {
                        if(ant.position == 1 && k < ant.y && Matrix[j][k].IsWall == false)
                        {
                        availableCells[temp] = {
                            x: j,
                            y: k,
                        }
                        temp++;
                        }
                        if(ant.position == 2 && j > ant.x && Matrix[j][k].IsWall == false)
                        {
                        availableCells[temp] = {
                            x: j,
                            y: k,
                        }
                        temp++;
                        }
                        if(ant.position == 3 && k > ant.y && Matrix[j][k].IsWall == false)
                        {
                        availableCells[temp] = {
                            x: j,
                            y: k,
                        }
                        temp++;
                        }
                        if(ant.position == 4 && j < ant.x && Matrix[j][k].IsWall == false)
                        {
                        availableCells[temp] = {
                            x: j,
                            y: k,
                        }
                        temp++;
                        }
                    }
                }
                if(temp == 0)
                {
                    ant.position = Math.floor(Math.random() * 4) + 1;
                    continue;
                }
                console.log(temp);
                let probabilities = [];
                let sum = 0;
                for (let q = 0; q < temp; q++) {
                    var cell = availableCells[q];
                    var pheromoneLevel = Matrix[cell.x][cell.y].FoodPheromone;
                    var probability = Math.pow(pheromoneLevel, alpha) * Math.pow(heuristicValue, beta);
                    probabilities.push(probability);
                    sum += probability;
                  }
                  for (let q = 0; q < probabilities.length; q++) {
                    probabilities[q] = probabilities[q] / sum;
                  }
                  var randomValue = Math.random();
                var index = 0;
                while (randomValue > 0) {
                randomValue -= probabilities[index];
                index++;
                }
                index--;
                Matrix[ant.x][ant.y].FoodPheromone += 0.3;
                ant.x = availableCells[index].x;
                ant.y = availableCells[index].y;
                drawAnt(ant);
            }
            if(kolvo == 1000)
            {
                break;
            }
        }
    }

    document.getElementById("generate-anthill").onclick = function() {
        IsAntHillButton = true;
        IsFoodButton = false;
        IsWallButton = false;

    }

    document.getElementById("generate-food").onclick = function() {
        IsFoodButton = true;
        IsAntHillButton = false;
        IsWallButton = false;
    }

    document.getElementById("generate-wall").onclick = function() {
        IsWallButton = true;
        IsFoodButton = false;
        IsAntHillButton = false;
    }

    document.getElementById("clear").onclick = function() {
        initStartVar();
        wallAndFoodCtx.clearRect(0, 0, wallAndFoodCanvas.width, wallAndFoodCanvas.height);
        mapPheromoneCtx.clearRect(0, 0, mapPheromoneCanvas.width, mapPheromoneCanvas.height);
        mapAntCtx.clearRect(0, 0, mapAntCanvas.width, mapAntCanvas.height);
    }

    //-----------------------------Map Building-------------------------------

    mapAntCanvas.onmousemove = function(e) {
        let x = e.offsetX;
        let y = e.offsetY;
        if (e.buttons === 1 && inMap(x, y) && IsFoodButton && !Matrix[x][y].IsWall) {
            changeAndDrawFood(x, y);
        }else if (e.buttons === 1 && inMap(x, y) && IsWallButton){
            changeAndDrawWall(x, y);
        }
    }

    mapAntCanvas.onmousedown = function(e) {
        Ants = new Array(30);
        for(let i = 0;i<30;++i)
        {
            Ants[i] = {
                x : e.offsetX,
                y : e.offsetY,
                position: Math.floor(Math.random() * 4) + 1, //1-top,2-right,3-down,4 - left
            }
        }
        let x = e.offsetX;
        let y = e.offsetY;
        if (e.buttons === 1 && inMap(x, y) && IsAntHillButton) {
            changeAndDrawAnthill(x, y);
        }
    }

    //-----------------------------Draw Function------------------------------
    function inMap(x, y) {
        return x >= 0 && y >= 0 && x <= wallAndFoodCanvas.width && y <= wallAndFoodCanvas.height;
    }

    function drawPoint(x, y, color, size, lineWidth, ctx){
        ctx.lineCap = "round";
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.stroke();
    }

    function selectColorFood(food){
        return "rgb(0, " + Math.floor(255 * food / MaxFood) + ", 0)";
    }

    //-----------------------------Change Function----------------------------
    function changeAndDrawFood(x, y) {
        for(let i = x - SizeBrush; i <= x + SizeBrush; i++){
            for(let j = y - SizeBrush; j <= y + SizeBrush; j++){
                if(inMap(i, j) && Matrix[i][j].Food < MaxFood && !Matrix[i][j].IsWall){
                    Matrix[i][j].Food += 1;
                    drawPoint(i, j, selectColorFood(Matrix[i][j].Food), 1, 1, wallAndFoodCtx);
                }
            }
        }
    }

    function changeAndDrawWall(x, y) {
        for(let i = x - SizeBrush; i <= x + SizeBrush; i++){
            for(let j = y - SizeBrush; j <= y + SizeBrush; j++){
                if(inMap(i, j)){
                    Matrix[i][j].IsWall = true;
                    drawPoint(i, j, "gray", 1, 1, wallAndFoodCtx);
                }
            }
        }
    }

    function changeAndDrawAnthill(x, y) {
        for(let i = x - AnthillSize * 2; i <= x + AnthillSize * 2; i++){
            for(let j = y - AnthillSize * 2; j <= y + AnthillSize * 2; j++){
                if(inMap(i, j) && (Matrix[i][j].Food > 0 || Matrix[i][j].IsWall || Matrix[i][j].IsAnthill)){
                    return;
                }
            }
        }
        Matrix[x][y].IsAnthill = true;
        drawPoint(x, y, AnthillColor, AnthillSize, 40, wallAndFoodCtx);
    }
});
