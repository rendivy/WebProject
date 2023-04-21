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
    const SizeOneBlock = 16;

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

        generate() {
            this.prim();
            this.removeDeadEnds(6);
            this.vegetate(4);
            this.removeDeadEnds(2);
            this.removeLonelyWalls();
            this.drawCave();
        }

        createMap() {
            let map = [];
            for (let i = 0; i < this.width; i++) {
                map[i] = [];
                for (let j = 0; j < this.height; j++) {
                    map[i][j] = -2;
                }
            }
            return map;
        }

        prim(){
            let start = {x: 0, y: 0};
            let toCheck = [];
            this.map[start.x][start.y] = -1;
            let directions = [];
            directions = this.getDirection(start, directions);
            for (let i = 0; i < directions.length; i++) {
                toCheck.push({
                    x: start.x + directions[i].x,
                    y: start.y + directions[i].y
                });
            }
            while (toCheck.length > 0) {
                let randomIndex = Math.floor(Math.random() * toCheck.length);
                let chosenCell = toCheck[randomIndex];
                toCheck.splice(randomIndex, 1);
                if (this.map[chosenCell.x][chosenCell.y] === -2) {
                    this.map[chosenCell.x][chosenCell.y] = -1;
                    directions = [];
                    directions = this.getDirection(chosenCell, directions);
                    let edges  = directions.slice();

                    while(edges.length > 0){
                        let i = Math.floor(Math.random() * edges.length);
                        let connectedCell = {
                            x: chosenCell.x + edges[i].x,
                            y: chosenCell.y + edges[i].y
                        }
                        if (this.map[connectedCell.x][connectedCell.y] === -1) {
                            let valX = connectedCell.x - edges[i].x / 2;
                            let valY = connectedCell.y - edges[i].y / 2;
                            this.map[valX][valY] = -1;
                            edges.splice(0, directions.length);
                            break;
                        }
                        edges.splice(i, 1);
                    }

                    for (let i = 0; i < directions.length; i++) {
                        let nextCell = {
                            x: chosenCell.x + directions[i].x,
                            y: chosenCell.y + directions[i].y,
                        };

                        if (this.map[nextCell.x][nextCell.y] === -2) {
                            toCheck.push(nextCell);
                        }
                    }
                }
            }
        }

        getDirection(cell, list) {
            if (cell.x > 1) {
                list.push({x: -2, y: 0});
            }
            if (cell.x < this.width - 2) {
                list.push({x: 2, y: 0});
            }
            if (cell.y > 1) {
                list.push({x: 0, y: -2});
            }
            if (cell.y < this.height - 2) {
                list.push({x: 0, y: 2});
            }
            return list;
        }

        removeDeadEnds(iterations) {
            for (let i = 0; i < iterations; i++) {
                let deadEnds = [];
                for (let x = 0; x < this.width; x++) {
                    for (let y = 0; y < this.height; y++) {
                        if (this.map[x][y] === -1) {
                            let neighbors = 0;
                            if (x - 1 >= 0 && this.map[x - 1][y] === -1) {
                                neighbors++;
                            }
                            if (x + 1 < this.width && this.map[x + 1][y] === -1) {
                                neighbors++;
                            }
                            if (y - 1 >= 0 && this.map[x][y - 1] === -1) {
                                neighbors++;
                            }
                            if (y + 1 < this.height && this.map[x][y + 1] === -1) {
                                neighbors++;
                            }
                            if (neighbors <= 1) {
                                deadEnds.push({x: x, y: y});
                            }
                        }
                    }
                    for(let i = 0; i < deadEnds.length; i++){
                        this.map[deadEnds[i].x][deadEnds[i].y] = -2;
                    }
                }
            }
        }

        vegetate(iterations) {
            for (let i = 0; i < iterations; i++) {
                let points = [];
                for (let x = 0; x < this.width; x++) {
                    for (let y = 0; y < this.height; y++) {
                        if(this.map[x][y] === -2){
                            let neighbors = 0;
                            for(let a = 0; a < 3; a++){
                                for(let b = 0; b < 3; b++){
                                    let neighborX = x - a;
                                    let neighborY = y - b;
                                    if(neighborX >= 0 && neighborX < this.width && neighborY >= 0 && neighborY < this.height){
                                        if(this.map[neighborX][neighborY] === -1){
                                            neighbors++;
                                        }
                                    }
                                }
                            }
                            if(neighbors >= 4){
                                points.push({x: x, y: y});
                            }
                        }
                    }
                }
                for (let point of points) {
                    this.map[point.x][point.y] = -1;
                }
            }
        }

        removeLonelyWalls() {
            for (let x = 0; x < this.width; x++) {
                for (let y = 0; y < this.height; y++) {
                    if(this.map[x][y] === -2){
                        if(x - 1 >= 0 && this.map[x - 1][y] === -2 ||
                            x + 1 < this.width && this.map[x + 1][y] === -2 ||
                            y - 1 >= 0 && this.map[x][y - 1] === -2 ||
                            y + 1 < this.height && this.map[x][y + 1] === -2){
                            continue;
                        }
                        this.map[x][y] = -1;
                    }
                }
            }
        }

        drawCave() {
            for (let i = 0; i < this.width; i++) {
                for (let j = 0; j < this.height; j++) {
                    if (i === 0 || j === 0 || i === this.width - 1 || j === this.height - 1) {
                        this.map[i][j] = -2;
                    }
                    if (this.map[i][j] === -2) {
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
