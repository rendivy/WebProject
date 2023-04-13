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

    let WallColor = "gray";

    let AntColor = "brown";
    let AntSize = 2;

    //-----------------------------Global Variables---------------------------
    let Matrix;
    let Ants;
    let AnthillCoordinates = [];
    let FoodCoordinates = [];
    let PheromoneCoordinates = [];

    let CountAnt = 10;
    const RadiusAntVision = 10;
    const FirstStepLength = 5;
    const UsualStepLength = 3;
    const HowOftenWandering = 0.3; //[0,1]

    let IsStartButton = false;
    let IsAntHillButton = false;
    let IsFoodButton = false;
    let IsWallButton = false;

    let SizeBrush = 10;

    const MaxFood = 16;

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

    function initListCoordinates() {
        AnthillCoordinates = [];
        FoodCoordinates = [];
        PheromoneCoordinates = [];
        for (let i = 0; i < wallAndFoodCanvas.width; i++) {
            for (let j = 0; j < wallAndFoodCanvas.height; j++) {
                if(Matrix[i][j].Food > 0){
                    FoodCoordinates.push({
                        x: i,
                        y: j,
                    });
                }
                if(Matrix[i][j].IsAnthill){
                    AnthillCoordinates.push({
                        x: i,
                        y: j,
                    });
                }
            }
        }
    }

    function initAnts() {
        Ants = new Array(CountAnt * AnthillCoordinates.length);
        for (let iCordAnthill = 0; iCordAnthill < AnthillCoordinates.length; iCordAnthill++) {
            for (let iAnt = 0; iAnt < CountAnt; iAnt++) {
                let r1 = Math.random() * 2 - 1;
                let r2 = Math.random() * 2 - 1;
                Ants[iCordAnthill * CountAnt + iAnt] = {
                    Vx: r1,
                    Vy: r2,
                    x: Math.floor(AnthillCoordinates[iCordAnthill].x + (r1 * (AnthillSize + FirstStepLength)) / (Math.sqrt(r1 ** 2 + r2 ** 2))),
                    y: Math.floor(AnthillCoordinates[iCordAnthill].y + (r2 * (AnthillSize + FirstStepLength)) / (Math.sqrt(r1 ** 2 + r2 ** 2))),
                    IsFood: true, // true - в поисках еды, false - возвращается домой
                    IsHome: false, //true - в поисках дома, false - возвращается к еде
                    HaveFood: false, //true - нашел еду, false - не нашел еду
                    step : function() {
                        let isInsideAnthill = false;
                        for (let i = 0; i < AnthillCoordinates.length; i++) {
                            if (Math.sqrt((this.x - AnthillCoordinates[i].x) ** 2 + (this.y - AnthillCoordinates[i].y) ** 2) <= AnthillSize) {
                                isInsideAnthill = true;
                                break;
                            }
                        }
                        if (!inMap(this.x, this.y) || isInsideAnthill) {
                            let r1 = Math.random() * 2 - 1;
                            let r2 = Math.random() * 2 - 1;
                            this.Vx = r1;
                            this.Vy = r2;
                            this.IsFood = true;
                            this.IsHome = false;
                            this.HaveFood = false;
                            let randAnthill = Math.floor(Math.random() * AnthillCoordinates.length);
                            this.x = Math.floor(AnthillCoordinates[randAnthill].x + (r1 * (AnthillSize + FirstStepLength)) / (Math.sqrt(r1 ** 2 + r2 ** 2)));
                            this.y = Math.floor(AnthillCoordinates[randAnthill].y + (r2 * (AnthillSize + FirstStepLength)) / (Math.sqrt(r1 ** 2 + r2 ** 2)));
                            return;
                        }

                        if (Matrix[this.x][this.y].IsWall) {
                            let newCord = getNewCordAfterWall(this.x, this.y, this.Vx, this.Vy);
                            this.x = newCord.x;
                            this.y = newCord.y;
                            this.Vx = newCord.Vx;
                            this.Vy = newCord.Vy;
                        }


                        if(Math.random() < HowOftenWandering){
                            let newCord = getCordWithWandering(this.x, this.y, this.Vx, this.Vy);
                            this.x = newCord.x;
                            this.y = newCord.y;
                            this.Vx = newCord.Vx;
                            this.Vy = newCord.Vy;
                        }else{
                            let newCord = getCord(this.x, this.y, this.Vx, this.Vy);
                            this.x = newCord.x;
                            this.y = newCord.y;
                        }
                    }
                }
            }
        }
    }

    //-----------------------------Math Functions-----------------------------
    function getCordWithWandering(x, y, Vx, Vy) {
        let newX = x + (Vx * UsualStepLength) / (Math.sqrt(Vx ** 2 + Vy ** 2));
        let newY = y + (Vy * UsualStepLength) / (Math.sqrt(Vx ** 2 + Vy ** 2));
        let r1 = Math.random() * 2 - 1;
        let r2 = Math.random() * 2 - 1;
        let newVx = Vx + r1 * 0.2;
        let newVy = Vy + r2 * 0.2;
        return {
            x: Math.floor(newX),
            y: Math.floor(newY),
            Vx: newVx,
            Vy: newVy,
        }
    }

    function getCord(x, y, Vx, Vy) {
        let newX = x + (Vx * UsualStepLength) / (Math.sqrt(Vx ** 2 + Vy ** 2));
        let newY = y + (Vy * UsualStepLength) / (Math.sqrt(Vx ** 2 + Vy ** 2));
        return {
            x: Math.floor(newX),
            y: Math.floor(newY),
        }
    }

    function getNewCordAfterWall(x, y, Vx, Vy) {
        while (inMap(x, y) && Matrix[x][y].IsWall) {
            x = Math.floor(x + (Vx * UsualStepLength) / (Math.sqrt(Vx ** 2 + Vy ** 2)));
            y = Math.floor(y + (Vy * UsualStepLength) / (Math.sqrt(Vx ** 2 + Vy ** 2)));
        }
        let r1 = Math.random() * 2 - 1;
        let r2 = Math.random() * 2 - 1;
        let newVx = (-1) * Vx + r1 * 0.2;
        let newVy = (-1) * Vy + r2 * 0.2;
        return {
            x: Math.floor(x),
            y: Math.floor(y),
            Vx: newVx,
            Vy: newVy,
        }
    }

            //-----------------------------Initialization-----------------------------
    initStartVar();

    //-----------------Map Building and Drawing Button-------------------------

    document.getElementById("start").onclick = function() {
        IsStartButton = true;
        initListCoordinates();
        initAnts();
        drawAnts();
        let id = setInterval(function() {
            if (!IsStartButton) {
                clearInterval(id);
            } else {
                for (let i = 0; i < Ants.length; i++) {
                    Ants[i].step();
                }
                drawAnts();
            }
        }, 10);
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
        IsStartButton = false;
        IsAntHillButton = false;
        IsWallButton = false;
        IsFoodButton = false;
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
        return x > 0 && y > 0 && x < wallAndFoodCanvas.width && y < wallAndFoodCanvas.height;
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

    function drawAnts(){
        mapAntCtx.clearRect(0, 0, mapAntCanvas.width, mapAntCanvas.height);
        for(let i = 0; i < Ants.length; i++){
            drawPoint(Ants[i].x, Ants[i].y, AntColor, AntSize, 10, mapAntCtx);
        }
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
                    drawPoint(i, j, WallColor, 1, 1, wallAndFoodCtx);
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
