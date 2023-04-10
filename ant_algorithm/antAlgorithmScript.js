window.addEventListener("load", function onWindowLoad(){
    //------------------------global variables for animation--------------------------
    let myCanvas = document.getElementById("canvas"),
        ctx = myCanvas.getContext('2d');

    let pointList = {
            x: [],
            y: []
    }

    let numberOfCities = 0;
    let otherEdgesOpacity = 0.15;
    let otherEdgesColor = "#999999";
    let otherEdgesWidth = 2;
    let townRadius = 7;
    let townColor = "#000000";
    let resultEdgesOpacity = 1;
    let resultEdgesColor = "#00ff00";
    let resultEdgesWidth = 4;
    let mainEdgesWidth = 4;
    let mainEdgesColor = "#ffff00";
    let mainEdgesOpacity = 1;
    let maxNumberOfCities = 50;

    //------------------------global variables for algorithm--------------------------

    let AntVariablesForAlgorithm = {
        NumberOfIterations : 10000,
        MaxNumberOfWithoutResultIterations : Math.min(pointList.x.length, 200),

        NumberOfAnts : Math.min(Math.pow(pointList.x.length, 2), 1000),
        InitialNumberOfPheromones : 0.2,

        Alfa : 1,
        Beta : 1.5,

        PathLengthConst : 10,
        PheromoneConst : 10,
        RemainingPheromones : 0.6
    }

    //------------------------struct way---------------------------------------------

    let Way = {
        lengthWay : 0,
        pheromones : 0,
        extraPheromones : 0
    }

    let Ant = {
        path : [],
        pathLength : 0,
        unvisitedCities : []
    }

    //----------------------getting user input points---------------------------------
    myCanvas.onmousedown = function newTown(e){
        let x = e.offsetX;
        let y = e.offsetY;
        if (e.buttons === 1 && x >= 0 && y >= 0 && x <= myCanvas.width && y <= myCanvas.height) {
            if(numberOfCities < maxNumberOfCities) {
                let flag = true;
                pointList.x.forEach((item, i) => {
                    if (Math.sqrt((item - x) ** 2 + (pointList.y[i] - y) ** 2) < townRadius * 2) {
                        flag = false;
                    }
                });
                if (flag) {
                    numberOfCities++;

                    //TODO: мб убрать сильно захламляет поле
                    for (let i = 0; i < pointList.x.length; i++) {
                        drawLine(pointList.x[i], pointList.y[i], x, y, otherEdgesColor, otherEdgesWidth, otherEdgesOpacity);
                    }

                    pointList.x.push(x);
                    pointList.y.push(y);

                    for(let i = 0; i < pointList.x.length; i++){
                        drawPoint(pointList.x[i], pointList.y[i], townColor, townRadius, 15);
                    }
                }
            }
            else {
                alert("You can't add more than " + maxNumberOfCities + " cities");
            }
        }
    };

    //----------------------draw function---------------------------------------------
    function drawPoint(x, y, color, size, lineWidth){
        ctx.lineCap = "round";
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.stroke();
    }

    function drawLine(x1, y1, x2, y2, color, width, opacity){
        ctx.globalAlpha = opacity;
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }

    function drawWay(way, color, width, opacity){
        ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
        for(let i = 0; i < pointList.x.length; i++){
            drawPoint(pointList.x[i], pointList.y[i], townColor, townRadius, 15);
        }
        for(let i = 0; i < way.length - 1; i++){
            drawLine(pointList.x[way[i]], pointList.y[way[i]], pointList.x[way[i + 1]], pointList.y[way[i + 1]], color, width, opacity);
        }
    }

    //----------------------ant algorithm---------------------------------------------

    function antAlgorithm(matrix){
        let bestWay = {
            lengthWay : Infinity,
            way : []
        };
        let newBestWay = {
            lengthWay: Infinity,
            way : []
        };

        const NumberOfIterations = 10000;
        const MaxNumberOfWithoutResultIterations = Math.min(Math.pow(pointList.x.length, 1), 200);

        const NumberOfAnts = Math.min(Math.pow(pointList.x.length, 2), 1000);
        const InitialNumberOfPheromones = 0.2;

        const Alfa = 1;
        const Beta = 1.5;

        const PathLengthConst = 10;
        const PheromoneConst = 10;
        const RemainingPheromones = 0.6;

        let iteration = 0;
        let numberOfWithoutResultIterations = 0;

        let id = setInterval(function(){
            iteration++;
            numberOfWithoutResultIterations++;
            newBestWay.lengthWay = Infinity;
            newBestWay.way = [];

            if(numberOfWithoutResultIterations > MaxNumberOfWithoutResultIterations || iteration > NumberOfIterations){
                drawWay(bestWay.way, resultEdgesColor, resultEdgesWidth, resultEdgesOpacity);
                clearInterval(id);
            } else {
                let unvisitedCities = [];
                for (let i = 0; i < pointList.x.length; i++) {
                    unvisitedCities.push(i);
                }

                let ants = [];
                for (let i = 0; i < NumberOfAnts; i++) {
                    ants.push({
                        path: [],
                        pathLength: 0,
                        unvisitedCities: unvisitedCities.slice()
                    });
                }

                for (let i = 0; i < matrix.length; i++) {
                    for (let j = 0; j < matrix.length; j++) {
                        matrix[i][j].extraPheromones = 0;
                    }
                }

                for (let i = 0; i < ants.length; i++) {

                    ants[i].path.push(getRandomInt(0, ants[i].unvisitedCities.length));
                    ants[i].unvisitedCities.splice(ants[i].unvisitedCities.indexOf(ants[i].path[0]), 1);

                    while (ants[i].unvisitedCities.length > 0) {
                        let probabilities = [];
                        let probability;
                        let probSum = 0;
                        for (let j = 0; j < ants[i].unvisitedCities.length; j++) {
                            probability = getProbabilityOfWay(matrix, ants, i, j);
                            probSum += probability;
                            probabilities.push(probability);
                        }
                        for (let j = 0; j < probabilities.length; j++) {
                            probabilities[j] /= probSum;
                        }
                        for (let j = 1; j < probabilities.length; j++) {
                            probabilities[j] += probabilities[j - 1];
                        }
                        let rand = Math.random();
                        let selectedCity;
                        for (let j = 0; j < probabilities.length; j++) {
                            if (rand < probabilities[j]) {
                                selectedCity = ants[i].unvisitedCities[j];
                                break;
                            }
                        }
                        changeExtraPheromones(matrix, ants, i, selectedCity);
                        ants[i].pathLength += matrix[ants[i].path[ants[i].path.length - 1]][selectedCity].lengthWay;
                        ants[i].path.push(selectedCity);
                        ants[i].unvisitedCities.splice(ants[i].unvisitedCities.indexOf(selectedCity), 1);
                    }

                    changeExtraPheromones(matrix, ants, i, ants[i].path[0]);
                    ants[i].pathLength += matrix[ants[i].path[ants[i].path.length - 1]][ants[i].path[0]].lengthWay;
                    ants[i].path.push(ants[i].path[0]);

                    if (ants[i].pathLength < newBestWay.lengthWay) {
                        newBestWay.lengthWay = ants[i].pathLength;
                        newBestWay.way = ants[i].path.slice();
                    }
                }
            }
            for(let i = 0; i < matrix.length; i++){
                for(let j = 0; j < matrix.length; j++){
                    matrix[i][j].pheromone *= RemainingPheromones;
                    matrix[i][j].pheromone += matrix[i][j].extraPheromones;
                }
            }

            if(newBestWay.lengthWay < bestWay.lengthWay){
                numberOfWithoutResultIterations = 0;
                bestWay.lengthWay = newBestWay.lengthWay;
                bestWay.way = newBestWay.way.slice();
                drawWay(bestWay.way, mainEdgesColor, mainEdgesWidth, mainEdgesOpacity);
            }

        }, 0);
    }

    function initAntAlgorithm(){
        //--------------------init matrix of ways--------------------------------------
        let matrix = new Array(pointList.x.length);
        for(let i = 0; i < pointList.x.length; i++){
            matrix[i] = new Array(pointList.x.length);
            for(let j = 0; j < pointList.x.length; j++){
                matrix[i][j] = Object.create(Way);
            }
        }
        for(let i = 0; i < pointList.x.length; i++){
            for(let j = 0; j < i; j++){
                matrix[i][j].lengthWay = getDistance(pointList.x[i], pointList.y[i], pointList.x[j], pointList.y[j]);
            }
            matrix[i][i].lengthWay = -Infinity;
            for(let j = i + 1; j < matrix.length; j++){
                matrix[i][j].lengthWay = getDistance(pointList.x[i], pointList.y[i], pointList.x[j], pointList.y[j]);
            }
        }
        for(let i = 0; i < pointList.x.length; i++){
            for(let j = 0; j < pointList.x.length; j++){
                matrix[i][j].pheromones = AntVariablesForAlgorithm.InitialNumberOfPheromones;
                matrix[i][j].extraPheromones = 0;
            }
        }

        antAlgorithm(matrix);
    }

    function getDistance(x1, y1, x2, y2){
        return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
    }

    function getProbabilityOfWay(matrix, ants, i, j){
        let probability = Math.pow(matrix[ants[i].path[ants[i].path.length - 1]][ants[i].unvisitedCities[j]].pheromones, AntVariablesForAlgorithm.Alfa);
        probability *= Math.pow(AntVariablesForAlgorithm.PathLengthConst / matrix[ants[i].path[ants[i].path.length - 1]][ants[i].unvisitedCities[j]].lengthWay, AntVariablesForAlgorithm.Beta);
        return probability;
    }

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
        //Максимум не включается, минимум включается
    }

    function changeExtraPheromones(matrix, ants, i, selectedCity){
        matrix[ants[i].path[ants[i].path.length - 1]][selectedCity].extraPheromones += AntVariablesForAlgorithm.PheromoneConst / matrix[ants[i].path[ants[i].path.length - 1]][selectedCity].lengthWay;
        matrix[selectedCity][ants[i].path[ants[i].path.length - 1]].extraPheromones += AntVariablesForAlgorithm.PheromoneConst / matrix[ants[i].path[ants[i].path.length - 1]][selectedCity].lengthWay;
    }

    //----------------------button click----------------------------------------------
    document.getElementById("generate-way").onclick = function start(){
        initAntAlgorithm();
    }
});
