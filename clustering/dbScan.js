// Определение переменных
const eps = 100;
const minPts = 7;
const noise = new Set();
const clusters = [];
const visited = new Set();

function runDBSCAN() {
    const {clusters, noise} = dbscan();
    colorClusters(clusters, noise);
}
function dbscan() {
    for (let i = 0; i < dots.length; i++) {
        const point = dots[i];
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
            expandCluster(cluster, point, neighbors);
        }
    }

    return {clusters, noise};
}


function rangeQuery(point) {
    return dots.filter(([x, y]) => {
        const distance = Math.sqrt(Math.pow(x - point[0], 2) + Math.pow(y - point[1], 2));
        return distance <= eps;
    });
}


function expandCluster(cluster, point, neighbors) {
    cluster.add(point);
    visited.add(point);

    for (let i = 0; i < neighbors.length; i++) {
        const neighbor = neighbors[i];
        if (!visited.has(neighbor)) {
            visited.add(neighbor);
            const newNeighbors = rangeQuery(neighbor);
            if (newNeighbors.length >= minPts) {
                neighbors = neighbors.concat(newNeighbors);
            }
        }
        if (!noise.has(neighbor)) {
            cluster.add(neighbor);
        }
    }
}

function colorClusters(clusters, noise) {
    const noiseColor = "#000000";
    const clusterColors = clusters.map(() => getRandomColor());
    for (let i = 0; i < dots.length; i++) {
        let inCluster = false;
        for (let j = 0; j < clusters.length; j++) {
            const cluster = clusters[j];
            if (cluster.has(dots[i])) {
                inCluster = true;
                ctx.fillStyle = clusterColors[j];
                drawCircle(dots[i][0], dots[i][1]);
                break;
            }
        }
        if (!inCluster && noise.has(dots[i])) {
            ctx.fillStyle = noiseColor;
            drawCircle(dots[i][0], dots[i][1]);
        }
    }
}

// Функция для получения случайного цвета
function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}



// Определение функции runDBSCAN(), которая запускает алгоритм dbscan() и раскрашивает точки на
