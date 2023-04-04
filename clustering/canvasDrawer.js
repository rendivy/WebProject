function clusterMeans() {
    const slider = document.getElementById("centroid-slider");
    const centroidCount = slider.value;
    drawDots();

    if (dots.length < centroidCount) {
        alert('Котик, количество кластеров не может быть больше, чем количество точек :3')
    } else {
        runKMeans(centroidCount);
    }
}

function runKMeans(centroidCount) {
    const centroids = initializeCentroids(centroidCount);
    const dotCentroidMap = assignDotsToCentroids(dots, centroids);
    const colors = generateColors(centroidCount);
    drawDots();


    for (let i = 0; i < dotCentroidMap.length; i++) {
        drawDot(dots[i][0], dots[i][1], colors[dotCentroidMap[i]]);
    }
}
function initializeCentroids(count) {
    const step = Math.floor(dots.length / count);
    const centroids = [];

    for (let i = 0; i < dots.length; i += step) {
        centroids.push(dots[i]);
    }

    return centroids;
}

function assignDotsToCentroids(dots, centroids) {
    const dotCentroidMap = [];
    for (let i = 0; i < dots.length; i++) {
        let minDistance = Infinity;
        let closestCentroidIndex = null;

        for (let j = 0; j < centroids.length; j++) {
            const distance = Math.sqrt((dots[i][0] - centroids[j][0]) ** 2 + (dots[i][1] - centroids[j][1]) ** 2);

            if (distance < minDistance) {
                minDistance = distance;
                closestCentroidIndex = j;
            }
        }

        dotCentroidMap.push(closestCentroidIndex);
    }

    return dotCentroidMap;
}

function generateColors(count) {
    const colors = [];
    for (let i = 0; i < count; i++) {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        colors.push(`rgb(${r}, ${g}, ${b})`);
    }

    return colors;
}

function drawDot(x, y, color) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.strokeStyle = "#000000";
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.strokeStyle = "#000000" ;
    ctx.fill();
    ctx.stroke();
}
