window.addEventListener("load", function onWindowLoad() {
    //---------------------------------Canvas---------------------------------
    let wallAndFoodCanvas = document.getElementById("canvas-map-wall-food"),
        wallAndFoodCtx = wallAndFoodCanvas.getContext('2d');

    let mapPheromoneCanvas = document.getElementById("canvas-map-pheromone"),
        mapPheromoneCtx = mapPheromoneCanvas.getContext('2d');

    let mapAntCanvas = document.getElementById("canvas-map-ant"),
        mapAntCtx = mapAntCanvas.getContext('2d');

    let infoCanvas = document.getElementById("canvas-info"),
        infoCtx = infoCanvas.getContext('2d');

    //---------------------global variables for animation---------------------

    let AnthillSize = 20;
    let AnthillColor = "red";

    let WallColor = "gray";

    let AntColor = "brown";
    let AntColorWithFood = "blue";
    let AntSize = 2;

    //-----------------------------Global Variables---------------------------
    let Matrix;
    let Ants;
    let AnthillCoordinates = [];
    let PheromoneCoordinates = [];

    //Ant
    let CountAnt = 200;
    const RadiusAntVision = 50;
    const AngleAntVision = 90;
    const FirstStepLength = 25;
    const UsualStepLength = 3 // 1
    const HowOftenWandering = 0.4; //[0,1]
    const HowOftenChangeDirectionByPheromone = 0.2; //[0,1]
    const MaxCountCrash = 30;

    //Pheromone
    const MinPheromoneValue = 0.00001;
    const MaxPheromoneValue = 1000;
    const MinPheromoneToDraw = 800;
    const PheromoneDecrease = 0.9995;
    const HowMuchPheromoneOneStep = 80;
    const PheromoneInfluence = 0.0009;

    //Cave
    const SizeOneBlock = 32;

    //UI Flags
    let IsStartButton = false;
    let IsAntHillButton = false;
    let IsFoodButton = false;
    let IsWallButton = false;

    let SizeBrush = 10;

    const MaxFood = 16;

    //Draw Flags
    const isDrawPheromone = true;
    const isDrawAntVision = false;
    const isDrawFood = true;
    const HowOftenDrawPheromone = 10;
    const HowOftenDrawFood = 100;

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

    function initAnts() {
        Ants = new Array(CountAnt * AnthillCoordinates.length);
        for (let iCordAnthill = 0; iCordAnthill < AnthillCoordinates.length; iCordAnthill++) {
            for (let iAnt = 0; iAnt < CountAnt; iAnt++) {
                let r1 = Math.random() * 2 - 1;
                let r2 = Math.random() * 2 - 1;
                Ants[iCordAnthill * CountAnt + iAnt] = {
                    Vx: r1,
                    Vy: r2,
                    x: rounding(AnthillCoordinates[iCordAnthill].x + (r1 * (AnthillSize + FirstStepLength)) / (Math.sqrt(r1 ** 2 + r2 ** 2))),
                    y: rounding(AnthillCoordinates[iCordAnthill].y + (r2 * (AnthillSize + FirstStepLength)) / (Math.sqrt(r1 ** 2 + r2 ** 2))),
                    IsFood: true, // true - в поисках еды, false - возвращается домой; HomePheromone - поиск по нему
                    IsHome: false, //true - в поисках дома, false - возвращается к еде; FoodPheromone - поиск по нему
                    CountCrash: 0,
                    Vision: inVision(rounding(AnthillCoordinates[iCordAnthill].x + (r1 * (AnthillSize + FirstStepLength)) / (Math.sqrt(r1 ** 2 + r2 ** 2))),
                        rounding(AnthillCoordinates[iCordAnthill].y + (r2 * (AnthillSize + FirstStepLength)) / (Math.sqrt(r1 ** 2 + r2 ** 2))),
                        r1, r2),
                    step : function() {
                        let numberAnthill;
                        let isInsideAnthill = false;

                        if(inMap(this.x, this.y) && Matrix[this.x][this.y].IsAnthill){
                            isInsideAnthill = true;
                            for(let i = 0; i < AnthillCoordinates.length; i++){
                                if(Math.sqrt((this.x - AnthillCoordinates[i].x) ** 2 + (this.y - AnthillCoordinates[i].y) ** 2) <= AnthillSize * 2){
                                    numberAnthill = i;
                                    break;
                                }
                            }
                        }

                        if(inMap(this.x, this.y) && Matrix[this.x][this.y].Food > 0 && this.IsFood){
                            Matrix[this.x][this.y].Food--;
                            this.IsFood = false;
                            this.IsHome = true;
                            this.Vx *= -1;
                            this.Vy *= -1;
                            let newCord = getCord(this.x, this.y, this.Vx, this.Vy);
                            this.x = newCord.x;
                            this.y = newCord.y;
                            return;
                        }

                        //----------------------------crash with anthill-------------------
                        if (!inMap(this.x, this.y) || isInsideAnthill || this.CountCrash > MaxCountCrash) {
                            if(this.CountCrash <= MaxCountCrash && this.IsHome && inMap(this.x, this.y)){
                                AnthillCoordinates[numberAnthill].countFood++;
                                infoCtx.clearRect(0, 0, infoCanvas.width, infoCanvas.height);
                                drawNumber(AnthillCoordinates[numberAnthill].x,
                                    AnthillCoordinates[numberAnthill].y,
                                    AnthillCoordinates[numberAnthill].countFood,
                                    infoCtx);
                            }
                            let r1 = Math.random() * 2 - 1;
                            let r2 = Math.random() * 2 - 1;
                            this.Vx = r1;
                            this.Vy = r2;
                            this.IsFood = true;
                            this.IsHome = false;
                            let randAnthill = Math.floor(Math.random() * AnthillCoordinates.length);
                            this.x = rounding(AnthillCoordinates[randAnthill].x + (r1 * (AnthillSize + FirstStepLength)) / (Math.sqrt(r1 ** 2 + r2 ** 2)));
                            this.y = rounding(AnthillCoordinates[randAnthill].y + (r2 * (AnthillSize + FirstStepLength)) / (Math.sqrt(r1 ** 2 + r2 ** 2)));
                            this.Vision = inVision(this.x, this.y, r1, r2);
                            this.CountCrash = 0;
                            return;
                        }

                        //---------------------------Pheromone---------------------------

                        if(this.IsFood){
                            Matrix[this.x][this.y].FoodPheromone = Math.min(Matrix[this.x][this.y].FoodPheromone + HowMuchPheromoneOneStep, MaxPheromoneValue);
                        }else{
                            Matrix[this.x][this.y].HomePheromone = Math.min(Matrix[this.x][this.y].HomePheromone + HowMuchPheromoneOneStep, MaxPheromoneValue);
                        }

                        //-------------------------------Wall------------------------------
                        let gridXY = getCord(this.x, this.y, this.Vx, this.Vy);
                        if(inMap(gridXY.x, gridXY.y) && (Matrix[gridXY.x][gridXY.y].IsWall || (this.IsHome && Matrix[gridXY.x][gridXY.y].Food))){
                            this.CountCrash++;
                            let newCord = getReflectCord(gridXY.x, gridXY.y, this.Vx, this.Vy, this.x, this.y);
                            this.x = newCord.x;
                            this.y = newCord.y;
                            this.Vx = newCord.Vx;
                            this.Vy = newCord.Vy;
                            return;
                        }
                        this.CountCrash = 0;

                        let vision = inVision(this.x, this.y, this.Vx, this.Vy);
                        this.Vision = vision;
                        if(vision.length !== 0 || vision.info.haveFood || vision.info.haveAnthill
                            || vision.info.haveFoodPheromone || vision.info.haveHomePheromone){
                            //---------------------------Food or anthill---------------------------
                            if((this.IsFood && vision.info.haveFood) || (this.IsHome && vision.info.haveAnthill)){
                                let nearestPoint = getNearestPointToFoodOrAnthill(this.x, this.y, vision.points);
                                this.Vx = nearestPoint.x - this.x;
                                this.Vy = nearestPoint.y - this.y;
                                let newCord = getCord(this.x, this.y, this.Vx, this.Vy);
                                this.x = newCord.x;
                                this.y = newCord.y;
                                return;
                            }
                            //---------------------------Pheromone---------------------------
                            if(!vision.info.haveWall && ((this.IsFood && vision.info.haveHomePheromone) || (this.IsHome && vision.info.haveFoodPheromone))){
                                if(Math.random() < HowOftenChangeDirectionByPheromone){
                                    let biggestPheromonePoint = getBiggestPheromonePoint(this.x, this.y, vision.points, !this.IsFood);
                                    let differenceX = (biggestPheromonePoint.x - this.x) - this.Vx;
                                    let differenceY = (biggestPheromonePoint.y - this.y) - this.Vy;
                                    if(this.IsFood) {
                                        this.Vx += differenceX * (Matrix[biggestPheromonePoint.x][biggestPheromonePoint.y].HomePheromone * PheromoneInfluence);
                                        this.Vy += differenceY * (Matrix[biggestPheromonePoint.x][biggestPheromonePoint.y].HomePheromone * PheromoneInfluence);
                                    }
                                    else {
                                        this.Vx += differenceX * (Matrix[biggestPheromonePoint.x][biggestPheromonePoint.y].FoodPheromone * PheromoneInfluence);
                                        this.Vy += differenceY * (Matrix[biggestPheromonePoint.x][biggestPheromonePoint.y].FoodPheromone * PheromoneInfluence);
                                    }
                                }
                            }
                            //---------------------------Try get around wall---------------------------
                            if(vision.info.haveWall){

                            }
                        }


                        //------------------------------Next step---------------------------
                        if(Math.random() < HowOftenWandering && this.IsFood){
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


    function getNearestWall(x, y, points){
        let min = Infinity;
        let index = 0;
        for(let i = 0; i < points.length; i++){
            if(Matrix[points[i].x][points[i].y].IsWall){
                let distance = getDistance(x, y, points[i].x, points[i].y);
                if(distance < min){
                    min = distance;
                    index = i;
                }
            }
        }
        return points[index];
    }

    function getBiggestPheromonePoint(x, y, points, isFood){
        let max = 0;
        let index = 0;
        for(let i = 0; i < points.length; i++){
            if(isFood){
                if(Matrix[points[i].x][points[i].y].FoodPheromone > max){
                    max = Matrix[points[i].x][points[i].y].FoodPheromone;
                    index = i;
                }
            }else{
                if(Matrix[points[i].x][points[i].y].HomePheromone > max){
                    max = Matrix[points[i].x][points[i].y].HomePheromone;
                    index = i;
                }
            }
        }
        return points[index];
    }

    function getNearestPointToFoodOrAnthill(x, y, points){
        let min = Infinity;
        let index = 0;
        for(let i = 0; i < points.length; i++){
            if(Matrix[points[i].x][points[i].y].Food || Matrix[points[i].x][points[i].y].IsAnthill) {
                let dist = getDistance(x, y, points[i].x, points[i].y);
                if (dist < min) {
                    min = dist;
                    index = i;
                }
            }
        }
        return points[index];
    }

    function getDistance(x1, y1, x2, y2){
        return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
    }

    function inVision(x, y, Vx, Vy) {
        const points = [];
        let info = {
            haveFood: false,
            haveAnthill: false,
            haveFoodPheromone: false,
            haveHomePheromone: false,
            haveWall: false,
        }
        const r = RadiusAntVision;
        const angle = AngleAntVision;
        const angle1 = Math.atan2(Vy, Vx) - (angle / 2) * (Math.PI / 180);
        const angle2 = Math.atan2(Vy, Vx) + (angle / 2) * (Math.PI / 180);
        let startX = x - r;
        let endX = x + r;
        let startY = y - r;
        let endY = y + r;
        if (Vx > 0) {
            startX = x;
        } else {
            endX = x;
        }
        if (Vy > 0) {
            startY = y;
        } else {
            endY = y;
        }
        for (let i = startX; i <= endX; i++) {
            for (let j = startY; j <= endY; j++) {
                if (inMap(i, j) && inSector(x, y, i, j, angle1, angle2) && Math.sqrt((i - x) ** 2 + (j - y) ** 2) <= r) {
                    const dx = i - x;
                    const dy = j - y;
                    const projection = dx * Vx + dy * Vy;
                    if (projection > 0) {
                        if(Matrix[i][j].Food) {
                            info.haveFood = true;
                        }
                        if(Matrix[i][j].IsAnthill) {
                            info.haveAnthill = true;
                        }
                        if(Matrix[i][j].FoodPheromone > 0) {
                            info.haveFoodPheromone = true;
                        }if(Matrix[i][j].HomePheromone > 0) {
                            info.haveHomePheromone = true;
                        }
                        if(Matrix[i][j].IsWall) {
                            info.haveWall = true;
                        }
                        points.push({ x: i, y: j });
                    }
                }
            }
        }
        return {
            points: points,
            info: info,
        }
    }

    function inSector(x, y, i, j, angle1, angle2) {
        let angle = Math.atan2(j - y, i - x);
        if (angle1 < angle2) {
            return angle >= angle1 && angle <= angle2;
        } else {
            return angle >= angle1 || angle <= angle2;
        }
    }

    function inMap(x, y) {
        return x > 0 && y > 0 && x < wallAndFoodCanvas.width && y < wallAndFoodCanvas.height;
    }

    function getCordWithWandering(x, y, Vx, Vy) {
        let newX = x + (Vx * UsualStepLength) / (Math.sqrt(Vx ** 2 + Vy ** 2));
        let newY = y + (Vy * UsualStepLength) / (Math.sqrt(Vx ** 2 + Vy ** 2));
        let r1 = Math.random() * 2 - 1;
        let r2 = Math.random() * 2 - 1;
        let newVx = Vx + r1 * 0.2;
        let newVy = Vy + r2 * 0.2;
        return {
            x: rounding(newX),
            y: rounding(newY),
            Vx: newVx,
            Vy: newVy,
        }
    }

    function getReflectCord(newX, newY, Vx, Vy, x, y) {
        let diffX = newX - x;
        let diffY = newY - y;
        if(diffX === 0 && diffY === 0){
            Vy *= -1;
        }
        else if (diffX === 0 && diffY === -1){
            Vy *= -1;
        }
        else if (diffX === -1 && diffY === 0){
            Vx *= -1;
        }
        else if (diffX === 1 && diffY === 0){
            Vx *= -1;
        }else {
            Vy *= -1;
            Vx *= -1;
        }
        let newCord = getCord(x, y, Vx, Vy, UsualStepLength);
        newX = newCord.x;
        newY = newCord.y;
        return {
            x: newX,
            y: newY,
            Vx: Vx,
            Vy: Vy,
        }
    }

    function getCord(x, y, Vx, Vy) {
        let newX = x + (Math.random() - 0.5) + (Vx * UsualStepLength) / (Math.sqrt(Vx ** 2 + Vy ** 2));
        let newY = y + (Math.random() - 0.5) + (Vy * UsualStepLength) / (Math.sqrt(Vx ** 2 + Vy ** 2));
        return {
            x: rounding(newX),
            y: rounding(newY),
        }
    }

    function rounding(float){
        if (float - Math.floor(float) < 0.5){
            return Math.floor(float);
        }else{
            return Math.ceil(float);
        }
    }

    //-----------------------------Initialization-----------------------------
    initStartVar();

    //-----------------Map Building and Drawing Button-------------------------

    document.getElementById("start").onclick = function() {
        IsStartButton = true;
        initAnts();
        drawAnts();
        let iter = 0;
        let id = setInterval(function() {
            iter++;
            if (!IsStartButton) {
                clearInterval(id);
            } else {
                for (let i = 0; i < Ants.length; i++) {
                    Ants[i].step();
                }
                if (isDrawPheromone && iter % HowOftenDrawPheromone === 0) {
                    drawPheromone();
                }
                if(isDrawFood && iter % HowOftenDrawFood === 0) {
                    drawFood();
                }
                if(iter === HowOftenDrawFood){
                    iter = 0;
                }
                drawAnts();
                changePheromone();
            }
        }, 0);
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
        AnthillCoordinates = [];
        PheromoneCoordinates = [];
        IsStartButton = false;
        IsAntHillButton = false;
        IsWallButton = false;
        IsFoodButton = false;
        wallAndFoodCtx.clearRect(0, 0, wallAndFoodCanvas.width, wallAndFoodCanvas.height);
        mapPheromoneCtx.clearRect(0, 0, mapPheromoneCanvas.width, mapPheromoneCanvas.height);
        mapAntCtx.clearRect(0, 0, mapAntCanvas.width, mapAntCanvas.height);
        infoCtx.clearRect(0, 0, infoCanvas.width, infoCanvas.height);
    }

    document.getElementById("generate-cave").onclick = function (){
        generateCave();
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

    function selectColorPheromone(cell){
        let max = Math.max(cell.FoodPheromone, cell.HomePheromone);
        if(max === cell.FoodPheromone){
            return "rgb(" + Math.floor(255 * max / MaxPheromoneValue) + ", 0, 0)";
        }else{
            return "rgb(0, 0, " + Math.floor(255 * max / MaxPheromoneValue) + ")";
        }
    }

    function drawAnts(){
        mapAntCtx.clearRect(0, 0, mapAntCanvas.width, mapAntCanvas.height);
        if(isDrawAntVision){
            for(let i = 0; i < Ants.length; i++){
                for (let j = 0; j < Ants[i].Vision.points.length; j++){
                    drawPoint(Ants[i].Vision.points[j].x, Ants[i].Vision.points[j].y, "yellow", 1, 1, mapAntCtx);
                }
            }
        }
        for(let i = 0; i < Ants.length; i++){
            if(Ants[i].IsFood){
                drawPoint(Ants[i].x, Ants[i].y, AntColor, AntSize, 10, mapAntCtx);
            }else{
                drawPoint(Ants[i].x, Ants[i].y, AntColorWithFood, AntSize, 10, mapAntCtx);
            }
        }
    }

    function drawPheromone(){
        mapPheromoneCtx.clearRect(0, 0, mapPheromoneCanvas.width, mapPheromoneCanvas.height);
        for(let i = 0; i < Matrix.length; i++){
            for(let j = 0; j < Matrix[i].length; j++){
                if(Matrix[i][j].FoodPheromone > MinPheromoneToDraw || Matrix[i][j].HomePheromone > MinPheromoneToDraw){
                    drawPoint(i, j, selectColorPheromone(Matrix[i][j]), 1, 1, mapPheromoneCtx);
                }
            }
        }
    }

    function drawFood(){
        for (let i = 0; i < Matrix.length; i++) {
            for(let j = 0; j < Matrix[i].length; j++){
                if(Matrix[i][j].Food){
                    drawPoint(i, j, selectColorFood(Matrix[i][j].Food), 1, 1, wallAndFoodCtx);
                }
            }
        }
    }

    function drawNumber(x, y, number, ctx){
        ctx.fillStyle = "#000000";
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText(number, x, y);
    }

    //-----------------------------Change Function----------------------------
    function changeAndDrawFood(x, y) {
        for(let i = x - SizeBrush; i <= x + SizeBrush; i++){
            for(let j = y - SizeBrush; j <= y + SizeBrush; j++){
                if(inMap(i, j) && Matrix[i][j].Food < MaxFood &&
                    !Matrix[i][j].IsWall && Math.sqrt((i - x) * (i - x) + (j - y) * (j - y)) <= SizeBrush){
                    Matrix[i][j].Food += 1;
                    drawPoint(i, j, selectColorFood(Matrix[i][j].Food), 1, 1, wallAndFoodCtx);
                }
            }
        }
    }

    function changeAndDrawWall(x, y) {
        for(let i = x - SizeBrush; i <= x + SizeBrush; i++){
            for(let j = y - SizeBrush; j <= y + SizeBrush; j++){
                //круговая кисть
                if(inMap(i, j) && Math.sqrt((i - x) * (i - x) + (j - y) * (j - y)) <= SizeBrush){
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
        AnthillCoordinates.push({x: x, y: y, countFood: 0});
        drawPoint(x, y, AnthillColor, AnthillSize, 40, wallAndFoodCtx);
        for(let i = x - AnthillSize * 2; i <= x + AnthillSize * 2; i++){
            for(let j = y - AnthillSize * 2; j <= y + AnthillSize * 2; j++){
                if(inMap(i, j) && Math.sqrt((i - x) * (i - x) + (j - y) * (j - y)) <= AnthillSize * 2){
                    Matrix[i][j].IsAnthill = true;
                }
            }
        }
    }

    function changePheromone(){
        for(let i = 0; i < Matrix.length; i++){
            for(let j = 0; j < Matrix[i].length; j++){
                if(Matrix[i][j].FoodPheromone > MinPheromoneValue){
                    Matrix[i][j].FoodPheromone = Math.max(MinPheromoneValue, Matrix[i][j].FoodPheromone * PheromoneDecrease)
                }
                if(Matrix[i][j].HomePheromone > MinPheromoneValue){
                    Matrix[i][j].HomePheromone = Math.max(MinPheromoneValue, Matrix[i][j].HomePheromone * PheromoneDecrease)
                }
            }
        }
    }

    //----------------------------Generate Cave-------------------------------

    function generateCave(){
        let hScaled = wallAndFoodCanvas.height / SizeOneBlock;
        let wScaled = wallAndFoodCanvas.width / SizeOneBlock;
        let cave = new CaveGenerator(wScaled, hScaled);
        cave.generate();
    }

    class CaveGenerator {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.map = [];
            this.map = this.createMap();
        }

        createMap() {
            let map = [];
            for (let i = 0; i < this.width; i++) {
                map[i] = [];
                for (let j = 0; j < this.height; j++) {
                    map[i][j] = 0;
                }
            }

            for (let i = 0; i < this.width; i++) {
                map[i][0] = 1;
                map[i][this.height - 1] = 1;
            }
            for (let j = 0; j < this.height; j++) {
                map[0][j] = 1;
                map[this.width - 1][j] = 1;
            }

            return map;
        }

        generate() {
            this.generateCave();
            this.generateBranches();
            this.smoothMap();
            this.connectCaves();
            this.drawCave();
        }

        generateBranches() {
            const branchDensity = 30;
            const numBranches = Math.floor((this.width * this.height) / branchDensity);
            const branchLength = 20;
            const branchRadius = 5;

            for (let i = 0; i < numBranches; i++) {
                let x = Math.floor(Math.random() * (this.width - branchLength * 2)) + branchLength;
                let y = Math.floor(Math.random() * (this.height - branchLength * 2)) + branchLength;
                for (let j = 0; j < branchLength; j++) {
                    let rx = Math.floor(Math.random() * (branchRadius * 2 + 1)) - branchRadius;
                    let ry = Math.floor(Math.random() * (branchRadius * 2 + 1)) - branchRadius;
                    let nx = x + rx;
                    let ny = y + ry;
                    if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
                        this.map[nx][ny] = 1;
                    }
                }
            }
        }

        connectCaves() {
            let visited = [];
            for (let i = 0; i < this.width; i++) {
                visited[i] = [];
            }

            for (let i = 1; i < this.width - 1; i++) {
                for (let j = 1; j < this.height - 1; j++) {
                    if (!visited[i][j] && this.map[i][j] === 0) {
                        let component = this.getConnectedComponent(i, j);
                        this.connectConnectedComponent(component);
                    }
                    visited[i][j] = true;
                }
            }
        }

        getConnectedComponent(x, y) {
            let visited = [];
            for (let i = 0; i < this.width; i++) {
                visited[i] = [];
            }

            let component = [];

            let dfs = (i, j) => {
                if (i < 0 || i >= this.width || j < 0 || j >= this.height) {
                    return;
                }
                if (visited[i][j]) {
                    return;
                }
                if (this.map[i][j] !== 0) {
                    return;
                }
                visited[i][j] = true;
                component.push({x: i, y: j});
                dfs(i - 1, j);
                dfs(i + 1, j);
                dfs(i, j - 1);
                dfs(i, j + 1);
            };

            dfs(x, y);

            return component;
        }

        connectConnectedComponent(component) {
            let minDist = 1000000;
            let minI = 0;
            let minJ = 0;

            for (let i = 0; i < component.length; i++) {
                let dist = this.getDistanceToBorder(component[i].x, component[i].y);
                if (dist < minDist) {
                    minDist = dist;
                    minI = component[i].x;
                    minJ = component[i].y;
                }
            }

            for (let i = 1; i < this.width - 1; i++) {
                for (let j = 1; j < this.height - 1; j++) {
                    if (this.map[i][j] === 1) {
                        let dist = Math.abs(i - minI) + Math.abs(j - minJ);
                        if (dist <= minDist) {
                            let path = this.getPath({x: i, y: j}, {x: minI, y: minJ});
                            for (let tile of path) {
                                this.map[tile.x][tile.y] = 0;
                            }
                        }
                    }
                }
            }
        }

        getPath(start, end) {
            let visited = [];
            for (let i = 0; i < this.width; i++) {
                visited[i] = [];
            }

            let queue = [];
            queue.push(start);

            let cameFrom = [];
            for (let i = 0; i < this.width; i++) {
                cameFrom[i] = [];
            }

            while (queue.length > 0) {
                let current = queue.shift();
                if (current.x === end.x && current.y === end.y) {
                    break;
                }
                let neighbours = this.getNeighbours(current.x, current.y);
                for (let neighbour of neighbours) {
                    if (!visited[neighbour.x][neighbour.y]) {
                        visited[neighbour.x][neighbour.y] = true;
                        cameFrom[neighbour.x][neighbour.y] = current;
                        queue.push(neighbour);
                    }
                }
            }

            let path = [];
            let current = end;
            while (current.x !== start.x || current.y !== start.y) {
                path.push(current);
                current = cameFrom[current.x][current.y];
            }
            path.push(start);
            path.reverse();
            return path;
        }

        getNeighbours(x, y) {
            let neighbours = [];
            if (x - 1 >= 0) {
                neighbours.push({x: x - 1, y: y});
            }
            if (x + 1 < this.width) {
                neighbours.push({x: x + 1, y: y});
            }
            if (y - 1 >= 0) {
                neighbours.push({x: x, y: y - 1});
            }
            if (y + 1 < this.height) {
                neighbours.push({x: x, y: y + 1});
            }
            return neighbours;
        }

        getDistanceToBorder(x, y) {
            let dist = 0;
            while (x - dist >= 0 && this.map[x - dist][y] === 0) {
                dist++;
            }
            return dist;
        }

        generateCave() {
            for (let i = 1; i < this.width - 1; i++) {
                for (let j = 1; j < this.height - 1; j++) {
                    if (Math.random() < 0.45) {
                        this.map[i][j] = 1;
                    }
                }
            }

            let visited = [];
            for (let i = 0; i < this.width; i++) {
                visited[i] = [];
            }

            let queue = [];
            for (let i = 1; i < this.width - 1; i++) {
                for (let j = 1; j < this.height - 1; j++) {
                    if (!visited[i][j] && this.map[i][j] === 1) {
                        let component = this.getConnectedComponent(i, j);
                        this.fillConnectedComponent(component);
                    }
                    visited[i][j] = true;
                }
            }

            for (let i = 0; i < 10; i++) {
                this.smoothMap();
            }
        }

        smoothMap() {
            for (let i = 1; i < this.width - 1; i++) {
                for (let j = 1; j < this.height - 1; j++) {
                    let count = 0;
                    for (let ii = i - 1; ii <= i + 1; ii++) {
                        for (let jj = j - 1; jj <= j + 1; jj++) {
                            if (ii < 0 || jj < 0 || ii >= this.width || jj >= this.height) {
                                continue;
                            }
                            if (this.map[ii][jj] === 1) {
                                count++;
                            }
                        }
                    }
                    if (count >= 5) {
                        this.map[i][j] = 1;
                    } else {
                        this.map[i][j] = 0;
                    }
                }
            }
        }

        fillConnectedComponent(component) {
            for (let [i, j] of component) {
                this.map[i][j] = 1;
            }
        }

        drawCave() {
            for (let i = 0; i < this.width; i++) {
                for (let j = 0; j < this.height; j++) {
                    if (this.map[i][j] === 1) {
                        this.drawOneBlock(i, j, WallColor, wallAndFoodCtx);
                    }
                }
            }
        }

        drawOneBlock(x, y, color, ctx) {
            for (let i = x * SizeOneBlock; i < (x + 1) * SizeOneBlock; i++) {
                for (let j = y * SizeOneBlock; j < (y + 1) * SizeOneBlock; j++) {
                    if (inMap(i, j)) {
                        Matrix[i][j].IsWall = true;
                        drawPoint(i, j, color, 1, 1, ctx);
                    }
                }
            }
        }
    }
});
