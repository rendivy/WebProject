const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const circleColor = "#000000FF";
const rect = canvas.getBoundingClientRect();
let dots = [];
let centroidXY = [];
let dotsToCentroid = [];
let centroidXYBegin = [];
let step;
let color = [];
let sumcentroidsX = [];
let sumcentroidsY = [];
let kolvoCenters = [];

canvas.clear = function () {
    ctx.clearRect(0, 0, 800, 730);
    dots = [];
    centroidXY = [];
    minS = [];
    dotsToCentroid = [];
    centroidXYBegin = [];
    step = 0;
    color = [];
    sumcentroidsX = [];
    sumcentroidsY = [];
    kolvoCenters = [];
    clusters = [];
    sumX = 0;
    sumY = 0;
    centroids = [];
    minn = 500;
    constI = [];
    constJ = [];
    h = [];
    container = [[]];
    ctx.fillStyle = "black";
};

canvas.addEventListener("mousedown", function (e) {
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    dots.push([x, y]);
    ctx.beginPath();
    ctx.arc(x, y, 17, 0, Math.PI * 2);
    ctx.fillStyle = circleColor;
    ctx.fill();
});

function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function drawDots() {
    ctx.fillStyle = "#1bc2ae";
    for (let i = 0; i < dots.length; i++) {
        ctx.beginPath();
        ctx.arc(dots[i][0], dots[i][1], 15, 0, Math.PI * 2);
        ctx.fill();
    }
}

function ClusteringKmeans(centroid) {

    centroidXY = [],
        dotsToCentroid = [],
        centroidXYBegin = [], step = 0,
        color = [], sumcentroidsX = [],
        sumcentroidsY = [], kolvoCenters = [];
    if (centroid === 0) {
        centroid = prompt('Сколь центроидов?', 2);
        ctx.clearRect(0, 0, 800, 730);
    }
    drawDots();
    if (dots.length < centroid) {
        alert('Ошибка');
        canvas.clear();

    } else {
        step = Math.floor(dots.length / centroid);

        for (let i = 0, j = 0; i < dots.length; i += step) {
            var x, y;
            x = dots[i][0];
            y = dots[i][1];
            centroidXY.push([x, y]);
        }

        for (let i = 0; i < centroid; i++) {
            color[i] = getRandomColor();
        }
        var count = 0;
        dotsToCentroid = [];
        while (count < 7) {

            centroidXYBegin = centroidXY;
            for (let i = 0; i < dots.length; i++) { // проходим по всем точкам
                var s = 0, min = 10000;

                for (let j = 0; j < centroid; j++) { // ищем расстояние между центрами и точками
                    var x, y;
                    x = centroidXY[j][0];
                    y = centroidXY[j][1];
                    s = Math.sqrt(((x - dots[i][0]) ** 2) + ((y - dots[i][1]) ** 2));

                    if (s < min) {
                        min = Math.min(min, s);
                        dotsToCentroid[i] = j;
                    }

                }

            }


            for (let index = 0; index < dotsToCentroid.length; index++) {
                sumcentroidsX[index] = 0;
                sumcentroidsY[index] = 0;
                kolvoCenters[index] = 0;
            }
            for (let h = 0; h < dotsToCentroid.length; h++) {

                ctx.beginPath();
                ctx.fillStyle = color[dotsToCentroid[h]];
                ctx.arc(dots[h][0], dots[h][1], 15, 0, Math.PI * 2);
                ctx.fill();
                sumcentroidsX[dotsToCentroid[h]] += dots[h][0];
                sumcentroidsY[dotsToCentroid[h]] += dots[h][1];
                kolvoCenters[dotsToCentroid[h]]++;
            }
            for (let h = 0; h < centroidXY.length; h++) {
                centroidXY[h][0] = sumcentroidsX[h] / kolvoCenters[h];
                centroidXY[h][1] = sumcentroidsY[h] / kolvoCenters[h];

            }
            count++;
        }
    }

}








