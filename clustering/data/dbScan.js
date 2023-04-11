const eps = 100;
let noise = new Set();
let clusters = [];
let visited = new Set();

function runDBSCAN() {
    dbscanStructClear()
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
    return dots.filter(([x, y]) => {
        const distance = Math.sqrt(Math.pow(x - point[0], 2) + Math.pow(y - point[1], 2));
        return distance <= eps;
    });
}


function expandCluster(cluster, point, neighbors, minPts) {
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




