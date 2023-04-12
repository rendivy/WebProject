window.addEventListener("load", function onWindowLoad() {
    //---------------------------------Canvas---------------------------------
    let wallAndFoodCanvas = document.getElementById("canvas-map-wall-food"),
        wallAndFoodCtx = wallAndFoodCanvas.getContext('2d');

    let mapPheromoneCanvas = document.getElementById("canvas-map-pheromone"),
        mapPheromoneCtx = mapPheromoneCanvas.getContext('2d');

    let mapAntCanvas = document.getElementById("canvas-map-ant"),
        mapAntCtx = mapAntCanvas.getContext('2d');

    //---------------------global variables for animation---------------------

    let AnthillSize = 20;
    let AnthillColor = "red";

    //-----------------------------Global Variables---------------------------
    let Matrix;

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
                    FoodPheromone: 0,
                    Food: 0,
                    IsWall: false,
                    IsAnthill: false,
                }
            }
        }
    }

    //-----------------------------Initialization-----------------------------
    initStartVar();

    //-----------------Map Building and Drawing Button-------------------------

    document.getElementById("start").onclick = function() {
        IsStartButton = true;
        for (let i = 0; i < 50; i++) {
            let row = [];
            for (let j = 0; j < 50; j++) {
                row.push(Matrix[i][j].Food);
            }
            console.log(row);
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
