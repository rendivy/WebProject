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

    //Ant
    let CountAnt = 200;
    const RadiusAntVision = 50;
    const AngleAntVision = 90;
    const FirstStepLength = 20;
    const UsualStepLength = 2;
    const HowOftenWandering = 0.2; //[0,1]
    const MaxCountCrash = 30;

    //Pheromone
    const MinPheromoneValue = 0.00001;
    const MaxPheromoneValue = 1000;
    const MinPheromoneToDraw = 800;
    const PheromoneDecrease = 0.999;
    const HowMuchPheromoneOneStep = 100;
    const HowOftenDrawPheromone = 10;
    const PheromoneInfluence = 0.01;

    //UI Flags
    let IsStartButton = false;
    let IsAntHillButton = false;
    let IsFoodButton = false;
    let IsWallButton = false

    let SizeBrush = 10;

    const MaxFood = 16;

    //Draw Flags
    const isDrawPheromone = true;

    //----------------------Initiate Global Variables-------------------------
    function initStartVar() {
        Matrix = new Array(wallAndFoodCanvas.width);
        for (let i = 0; i < wallAndFoodCanvas.width; i++) {
            Matrix[i] = new Array(wallAndFoodCanvas.height);
            for (let j = 0; j < wallAndFoodCanvas.height; j++) {
                Matrix[i][j] = {
                    HomePheromone: Math.random()% 0.2,
                    FoodPheromone: Math.random()% 0.2,
                    Food: 0,
                    IsWall: false,
                    IsAnthill: false,
                    IsNotRealAnthill: false,
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
                        countFood: 0,
                        x: i,
                        y: j,
                    });
                    for(let q = i-40;q<i+40;++q)
                    {
                        for(let k = j-40;k<j+40;++k)
                        {
                            Matrix[q][k].IsNotRealAnthill = true;
                        }
                    }
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
                    IsFood: true, // true - в поисках еды, false - возвращается домой
                    IsHome: false, //true - в поисках дома, false - возвращается к еде
                    HaveFood: false, //true - нашел еду, false - не нашел еду
                    CountCrash: 0,
                    step : function() {
                        let numberAnthill;
                        let isInsideAnthill = false;
                        for (let i = 0; i < AnthillCoordinates.length; i++) {
                            if (Math.sqrt((this.x - AnthillCoordinates[i].x) ** 2 + (this.y - AnthillCoordinates[i].y) ** 2) <= AnthillSize) {
                                isInsideAnthill = true;
                                numberAnthill = i;
                                break;
                            }
                        }
                        //----------------------------crash with anthill-------------------
                        if(inMap(this.x, this.y) && this.IsFood ==false && Matrix[this.x][this.y].IsNotRealAnthill == true)
                        {
                            isInsideAnthill = true;
                            numberAnthill = 0;
                        }
                        if (!inMap(this.x, this.y) || isInsideAnthill || this.CountCrash > MaxCountCrash) {
                            if(this.CountCrash<=MaxCountCrash && isInsideAnthill && this.IsHome)
                            {
                                AnthillCoordinates[numberAnthill].countFood += 1;
                                console.log(AnthillCoordinates[numberAnthill].countFood);
                            }
                            let r1 = Math.random() * 2 - 1;
                            let r2 = Math.random() * 2 - 1;
                            this.Vx = r1;
                            this.CountCrash = 0;
                            this.Vy = r2;
                            this.IsFood = true;
                            this.IsHome = false;
                            this.HaveFood = false;
                            let randAnthill = Math.floor(Math.random() * AnthillCoordinates.length);
                            this.x = rounding(AnthillCoordinates[randAnthill].x + (r1 * (AnthillSize + FirstStepLength)) / (Math.sqrt(r1 ** 2 + r2 ** 2)));
                            this.y = rounding(AnthillCoordinates[randAnthill].y + (r2 * (AnthillSize + FirstStepLength)) / (Math.sqrt(r1 ** 2 + r2 ** 2)));
                            return;
                        }
                        //-------------------------------Wall------------------------------

                        if(this.IsFood){
                            Matrix[this.x][this.y].FoodPheromone = Math.min(Matrix[this.x][this.y].FoodPheromone + HowMuchPheromoneOneStep, MaxPheromoneValue);
                        }
                        if(this.IsHome){
                            Matrix[this.x][this.y].HomePheromone = Math.min(Matrix[this.x][this.y].HomePheromone + HowMuchPheromoneOneStep, MaxPheromoneValue);
                        }

                        let gridXY = getCord(this.x, this.y, this.Vx, this.Vy);
                        if(inMap(gridXY.x, gridXY.y) && Matrix[gridXY.x][gridXY.y].IsWall){
                            this.CountCrash++;
                            let newCord = getReflectCord(gridXY.x, gridXY.y, this.Vx, this.Vy, this.x, this.y);
                            this.x = newCord.x;
                            this.y = newCord.y;
                            this.Vx = newCord.Vx;
                            this.Vy = newCord.Vy;
                            return;
                        }
                        if(inMap(gridXY.x, gridXY.y)&& Matrix[gridXY.x][gridXY.y].Food)
                        {
                            if(this.IsFood)
                            {
                            this.IsFood = !this.IsFood;
                            this.IsHome = !this.IsHome;
                            }
                            this.Vx = (-1) * this.Vx;
                            this.Vy = (-1) * this.Vy;
                        }
                        this.CountCrash = 0;
                        let FoodOrAnthillVisian  = FoodORAnthillInVision(this.x, this.y, this.Vx, this.Vy, this.IsFood);
                        if(FoodOrAnthillVisian.indexX !== null && FoodOrAnthillVisian.indexY!==null){           
                            this.Vx = FoodOrAnthillVisian.indexX - this.x;
                            this.Vy = FoodOrAnthillVisian.indexY - this.y;

                        }
                        let PheromoneVisian = PheromonInVision(this.x, this.y, this.Vx, this.Vy,this.IsFood)
                        if(PheromoneVisian.x !== undefined && PheromoneVisian.y!==undefined)
                        {
                            let differenceX = (PheromoneVisian.x-this.x) - this.Vx;
                            let differenceY = (PheromoneVisian.y-this.y) - this.Vy;
                            if(this.IsFood)
                            {
                                this.Vx += differenceX*(Matrix[PheromoneVisian.x][PheromoneVisian.y].HomePheromone*PheromoneInfluence)
                                this.Vy += differenceY*(Matrix[PheromoneVisian.x][PheromoneVisian.y].HomePheromone*PheromoneInfluence)
                            }
                            else
                            {
                                this.Vx += differenceX*(Matrix[PheromoneVisian.x][PheromoneVisian.y].FoodPheromone*PheromoneInfluence)
                                this.Vy += differenceY*(Matrix[PheromoneVisian.x][PheromoneVisian.y].FoodPheromone*PheromoneInfluence)
                            }
                            /*                  
                            if(this.Vx >2)
                            {
                                this.Vx = 2;
                            }
                            if(this.Vx <-2)
                            {
                                this.Vx = -2;
                            }
                            if(this.Vy >2)
                            {
                                this.Vy = 2;
                            }
                            if(this.Vy <-2)
                            {
                                this.Vy = -2;
                            }
                            if(this.Vx < 0.2 && this.Vx > 0)
                            {
                                this.Vx = 0.4;
                            }
                            if(this.Vx > -0.2 && this.Vx < 0)
                            {
                                this.Vx = -0.4;
                            }
                            if(this.Vy < 0.2 && this.Vy > 0)
                            {
                                this.Vy = 0.4;
                            }
                            if(this.Vy > -0.2 && this.Vy < 0)
                            {
                                this.Vy = -0.8;
                            }
                            */
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


    function PheromonInVision(x, y, Vx, Vy, IsFood)
    {
        let max = 0;
        let maxXIndex;
        let maxYIndex;
        let i;
        let j;
        let points = [];
        points = inVision(x, y, Vx, Vy);
        for(let k = 0;k<points.length;++k)
        {
            i = points[k].y;
            j = points[k].x;
            if(inMap(i,j))
            {
                    if(IsFood)
                    if(Matrix[i][j].HomePheromone > max)
                    {
                        max = Matrix[i][j].HomePheromone;
                        maxXIndex = j;
                        maxYIndex = i;
                    }
                    if(!IsFood)
                    if(Matrix[i][j].FoodPheromone > max)
                    {
                        max = Matrix[i][j].FoodPheromone;
                        maxXIndex = j;
                        maxYIndex = i;
                    }
            }
        }
        return{
            x: maxXIndex,
            y: maxYIndex,
        }
    }
    function inVision(x, y, Vx, Vy) {
        const points = [];
        const r = RadiusAntVision;
        const angle = AngleAntVision;
        const angle1 = Math.atan2(Vy, Vx) - (angle / 2) * (Math.PI / 180);
        const angle2 = Math.atan2(Vy, Vx) + (angle / 2) * (Math.PI / 180);
        for (let i = x - r; i <= x + r; i++) {
            for (let j = y - r; j <= y + r; j++) {
                if (inMap(i, j) && inSector(x, y, i, j, angle1, angle2) && Math.sqrt((i - x) ** 2 + (j - y) ** 2) <= r) {
                    const dx = i - x;
                    const dy = j - y;
                    const projection = dx * Vx + dy * Vy;
                    if (projection > 0) {
                        points.push({ x: i, y: j });
                    }
                }
            }
        }
        return points;
    }
    function inSector(x, y, i, j, angle1, angle2) {
        let angle = Math.atan2(j - y, i - x);
        if (angle1 < angle2) {
            return angle >= angle1 && angle <= angle2;
        } else {
            return angle >= angle1 || angle <= angle2;
        }
    }
    function FoodORAnthillInVision(x, y, Vx, Vy, IsFood)
    {
        let i;
        let j;
        let points = [];
        points = inVision(x, y, Vx, Vy);
        for(let k = 0;k<points.length;++k)
        {
            i = points[k].y;
            j = points[k].x;
            if(inMap(i,j))
            {
                    if(Matrix[i][j].IsNotRealAnthill == true && !IsFood||  Matrix[i][j].Food>0 && IsFood)
                    {
                        return{
                            indexX:j,
                            indexY:i,
                        }
                    }
            }
        }
        return{
            indexX:null,
            indexY:null,
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
        initListCoordinates();
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
        for(let i = 0; i < Ants.length; i++){
            if(Ants[i].IsFood)
            {
                AntColor = "Red";
                drawPoint(Ants[i].x, Ants[i].y, AntColor, AntSize, 10, mapAntCtx);
            }
            else {
                AntColor = "Blue";
                drawPoint(Ants[i].x, Ants[i].y, AntColor, AntSize, 10, mapAntCtx);
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
});
