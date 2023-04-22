let sliderEPS = document.getElementById("eps-slider")
let eps = sliderEPS.value
let noise = new Set();
let clusters = [];
let visited = new Set();

function runDBSCAN() {
    dbscanStructClear();
    let minPts = 5;
    shuffleArray(points);
    const { clusters, noise } = dbscanAlgorithm(minPts);
    colorClusters(clusters, noise);
}

//Перемешиваем массив точек, чтобы рандомно выбирать стартовый кластер
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

//Запускаем алгоритм и проходимся по всем точкам. Если точка не посещена, то запускаем rangeQuery.
function dbscanAlgorithm(minPts) {
    for (let i = 0; i < points.length; i++) {
        const point = points[i];
        if (visited.has(point)) {
            continue;
        }
        visited.add(point);
        const neighbors = rangeQuery(point);
        if (neighbors.length < minPts) {
            noise.add(point);
        } else {
            const cluster = new Set();
            clusters.push(cluster);
            expandCluster(cluster, point, neighbors, minPts);
        }
    }

    return {clusters, noise};
}

//Находим все точки, которые находятся на eps от нашей выбранной точки.
function rangeQuery(point) {
    const neighbors = [];
    for (let i = 0; i < points.length; i++) {
        const otherPoint = points[i];
        if (point === otherPoint) {
            continue;
        }
        const distance = Math.abs(otherPoint[0] - point[0]) + Math.abs(otherPoint[1] - point[1]);
        if (distance <= eps) {
            neighbors.push(otherPoint);
        }
    }
    return neighbors;
}

//Расширяем наши кластеры точками, которые находятся от нашей точки в радиусе eps и не является шумными
function expandCluster(cluster, point, neighbors, minPts) {
    cluster.add(point);
    visited.add(point);
    for (let i = 0; i < neighbors.length; i++) {
        const neighbor = neighbors[i];
        if (!visited.has(neighbor)) {
            visited.add(neighbor);
            const newNeighbors = rangeQuery(neighbor);
            if (newNeighbors.length >= minPts) {
                neighbors.push(...newNeighbors);
            }
        }
        if (!noise.has(neighbor) && !cluster.has(neighbor)) {
            cluster.add(neighbor);
        }
    }
}

function colorClusters(clusters, noise) {
    const noiseColor = "#000000";
    const clusterColors = clusters.map(() => getRandomColor());
    for (let i = 0; i < points.length; i++) {
        let inCluster = false;
        for (let j = 0; j < clusters.length; j++) {
            const cluster = clusters[j];
            if (cluster.has(points[i])) {
                inCluster = true;
                secondContext.fillStyle = clusterColors[j];
                secondContext.lineWidth = 4;
                drawCircleScan(points[i][0], points[i][1]);
                break;
            }
        }
        if (!inCluster && noise.has(points[i])) {
            secondContext.fillStyle = noiseColor;
            drawCircleScan(points[i][0], points[i][1]);
        }
    }
}

function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function dbscanStructClear() {
    noise = new Set();
    clusters = [];
    visited = new Set();
}
