const eps = 150; // adjust this value
let noise = new Set();
let clusters = [];
let visited = new Set();

function runDBSCAN() {
    dbscanStructClear();
    let sliderPts = document.getElementById("dbscan-slider");
    let minPts = sliderPts.value;
    const {clusters, noise} = dbscan(minPts);
    colorClusters(clusters, noise);
}

function dbscan(minPts) {
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
            expandCluster(cluster, point, neighbors, minPts);
        }
    }

    return {clusters, noise};
}

function rangeQuery(point) {
    return dots.filter(otherPoint => {
        const distance = manhattanDistance(otherPoint, point);
        return distance <= eps;
    });
}

function manhattanDistance(point1, point2) {
    return Math.abs(point1[0] - point2[0]) + Math.abs(point1[1] - point2[1]);
}

function expandCluster(cluster, point, neighbors, minPts) {
    cluster.add(point);
    visited.add(point);
    let i = 0;
    while (i < neighbors.length) {
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
        i++;
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
                ctx2.fillStyle = clusterColors[j];
                ctx2.lineWidth = 4;
                drawCircleScan(dots[i][0], dots[i][1]);
                break;
            }
        }
        if (!inCluster && noise.has(dots[i])) {
            ctx2.fillStyle = noiseColor;
            drawCircleScan(dots[i][0], dots[i][1]);
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
