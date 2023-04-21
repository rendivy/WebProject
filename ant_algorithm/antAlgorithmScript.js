window.addEventListener("load", function onWindowLoad(){
    //------------------------global variables for animation--------------------------
    let myCanvas = document.getElementById("canvas"),
        ctx = myCanvas.getContext('2d');

    let pointList = {
            x: [],
            y: []
    }

    let townRadius = 7;
    let townColor = "#000000";
    let resultEdgesOpacity = 1;
    let resultEdgesColor = "#05f240";
    let resultEdgesWidth = 4;
    let tempEdgesWidth = 4;
    let tempEdgesColor = "#07b7e3";
    let tempEdgesOpacity = 1;
    let pheromonesEdgesOpacity = 0.1;
    let pheromonesEdgesColor = "#979c98";
    let pheromonesEdgesWidth = 40;

    //------------------------global variables for ant algorithm-----------------------

    let numberOfCities = 0;
    let maxNumberOfCities = 50;

    const Iterations = 10000;
    const Evaporation = 0.3;
    const Alfa = 1;
    const Beta = 3;
    const PheromoneConst = 10;
    const PathLengthConst = 10;
    const InitialPheromones = 0.2;

    //------------------------global flags--------------------------------------------

    let isStart = false;

    //------------------------struct--------------------------------------------------

    let Way = {
        lengthWay : 0,
        pheromone : 0,
        extraPheromones : 0
    }

    //----------------------getting user input points---------------------------------
    myCanvas.onmousedown = function newCity(e){
        let x = e.offsetX;
        let y = e.offsetY;

        let isInPoint = false;
        pointList.x.forEach((item, i) => {
            if(Math.sqrt((item - x) ** 2 + (pointList.y[i] - y) ** 2) < townRadius * 2){
                isInPoint = true;
            }
        });

        if(!isStart && isInPoint){
            debugger;
            ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
            let index = pointList.x.findIndex((item, i) => {
                if(Math.sqrt((item - x) ** 2 + (pointList.y[i] - y) ** 2) < townRadius * 2){
                    return true;
                }
            });
            pointList.x.splice(index, 1);
            pointList.y.splice(index, 1);
            numberOfCities--;
            for(let i = 0; i < pointList.x.length; i++){
                drawPoint(pointList.x[i], pointList.y[i], townColor, townRadius, 15);
            }
        }

        else if (e.buttons === 1 && x >= 0 && y >= 0 && x <= myCanvas.width && y <= myCanvas.height && !isStart) {
            if(numberOfCities < maxNumberOfCities) {
                numberOfCities++;
                pointList.x.push(x);
                pointList.y.push(y);
                drawPoint(x, y, townColor, townRadius, 15);
            }
            else {
                alert("You can't add more than " + maxNumberOfCities + " cities");
            }
        }
    };

    document.getElementById("generate-way").onclick = function start(){
        if(!isStart) {
            initAntAlgorithm();
        }
    }

    document.getElementById("clear").onclick = function clear(){
        ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
        document.getElementById("result").innerHTML = "Длина пути: <br>Количество итераций:";
        pointList.x = [];
        pointList.y = [];
        numberOfCities = 0;
    }

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

    function drawLine(x1, y1, x2, y2, color, width, opacity, blur) {
        ctx.globalAlpha = opacity;
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        if (blur !== undefined && blur) {
            ctx.shadowBlur = 100;
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
    }

    function drawTrackPheromones(matrix){
        for(let i = 0; i < matrix.length; i++){
            for(let j = 0; j < matrix.length; j++){
                if(matrix[i][j].pheromone > 0){
                    drawLinePheromones(i, j, matrix);
                }
            }
        }
    }

    function drawLinePheromones(i, j, matrix){
        let x1 = pointList.x[i];
        let y1 = pointList.y[i];
        let x2 = pointList.x[j];
        let y2 = pointList.y[j];
        let color = pheromonesEdgesColor;
        let width = pheromonesEdgesWidth * matrix[i][j].pheromone / maxPheromone(matrix);
        let opacity = matrix[i][j].pheromone * pheromonesEdgesOpacity;
        let blur = true;
        drawLine(x1, y1, x2, y2, color, width, opacity, blur);
    }

    function drawWay(way, color, width, opacity, matrix, isResult){
        if(isResult === undefined){
            ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
            drawTrackPheromones(matrix);
        }
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

        const WithoutChangesOperation = Math.min(pointList.x.length, 200);
        const CountAnts = Math.min(pointList.x.length ** 2, 1000);

        let iteration = 0;
        let numberOfWithoutResultIterations = 0;

        let id = setInterval(function(){
            iteration++;
            numberOfWithoutResultIterations++;
            newBestWay.lengthWay = Infinity;
            newBestWay.way = [];

            if(numberOfWithoutResultIterations > WithoutChangesOperation || iteration > Iterations){
                drawWay(bestWay.way, resultEdgesColor, resultEdgesWidth, resultEdgesOpacity, matrix, true);
                printResult(bestWay.lengthWay, iteration);
                isStart = false;
                clearInterval(id);
            } else {
                let unvisitedCities = new Array(pointList.x.length).fill(0).map((item, i) => i);

                let ants = new Array(CountAnts).fill(0).map(() => {
                    return {
                        path: [],
                        pathLength: 0,
                        unvisitedCities: unvisitedCities.slice()
                    };
                });

                matrix.forEach((item) => { item.forEach((item) => { item.extraPheromones = 0;}); });

                for (let i = 0; i < ants.length; i++) {

                    ants[i].path.push(getRandomInt(0, ants[i].unvisitedCities.length));
                    ants[i].unvisitedCities.splice(ants[i].unvisitedCities.indexOf(ants[i].path[0]), 1);

                    while (ants[i].unvisitedCities.length > 0) {
                        let probabilities = [];
                        let probability;
                        let probSum = 0;
                        for (let j = 0; j < ants[i].unvisitedCities.length; j++) {
                            probability = getProbability(matrix, ants, i, j);
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
                            if (probabilities[j] > rand) {
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

            matrix.forEach((item) => { item.forEach((item) => { item.pheromone *= Evaporation; item.pheromone += item.extraPheromones}); });

            if(newBestWay.lengthWay < bestWay.lengthWay){
                numberOfWithoutResultIterations = 0;
                bestWay.lengthWay = newBestWay.lengthWay;
                bestWay.way = newBestWay.way.slice();
                drawWay(bestWay.way, tempEdgesColor, tempEdgesWidth, tempEdgesOpacity, matrix);
            }

        }, 0);
    }

    function initAntAlgorithm(){
        //--------------------init matrix of ways--------------------------------------
        isStart = true;
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
        matrix.forEach((item) => { item.forEach((item) => { item.pheromone = InitialPheromones; item.extraPheromones = 0;}); });
        antAlgorithm(matrix);
    }

    function printResult(lengthWay, iteration){
        let result = document.getElementById("result");
        result.innerHTML = "Длина пути: " + lengthWay + "<br>Количество итераций: " + iteration;
    }

    //--------------------------calc metrics--------------------------------------------
    function getDistance(x1, y1, x2, y2){
        return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
    }

    function getProbability(matrix, ants, i, j){
        let probability = Math.pow(matrix[ants[i].path[ants[i].path.length - 1]][ants[i].unvisitedCities[j]].pheromone, Alfa);
        probability *= Math.pow(PathLengthConst / matrix[ants[i].path[ants[i].path.length - 1]][ants[i].unvisitedCities[j]].lengthWay, Beta);
        return probability;
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min))) + Math.ceil(min);
    }

    function changeExtraPheromones(matrix, ants, i, selectedCity){
        matrix[ants[i].path[ants[i].path.length - 1]][selectedCity].extraPheromones += PheromoneConst / matrix[ants[i].path[ants[i].path.length - 1]][selectedCity].lengthWay;
        matrix[selectedCity][ants[i].path[ants[i].path.length - 1]].extraPheromones += PheromoneConst / matrix[ants[i].path[ants[i].path.length - 1]][selectedCity].lengthWay;
    }

    function maxPheromone(matrix){
        let max = 0;
        for(let i = 0; i < matrix.length; i++){
            for(let j = 0; j < matrix.length; j++){
                if(matrix[i][j].pheromone > max){
                    max = matrix[i][j].pheromone;
                }
            }
        }
        return max;
    }

});
