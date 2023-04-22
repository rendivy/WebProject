//Запускаем наш алгоритм
function clusterMeans() {
    let slider = document.getElementById("centroid-slider");
    let centroidCount = slider.value;
    drawDots();

    if (points.length < centroidCount) {
        alert('Количество кластеров не может быть больше, чем количество точек');
    } else {
        let colors = generateColors(centroidCount);
        let initialCentroids = kMeansPlusPlus(points, centroidCount);
        let {dotCentroidMap} = runKMeans(points, initialCentroids, colors);
        drawDots();

        for (let i = 0; i < dotCentroidMap.length; i++) {
            drawDot(points[i][0], points[i][1], colors[dotCentroidMap[i]]);
        }
    }
}


//Перерасчитываем центроиды и назначем точки кластерам до тех пор, пока пока центроиды не перестанут изменяться
//На каждый перерасчёт вызываем assignDotsToCentroids, обновляя карту центроидов
function runKMeans(dots, centroids, colors) {
    let oldCentroids = [];
    let dotCentroidMap = assignDotsToCentroids(dots, centroids);

    while (!centroidsEqual(oldCentroids, centroids)) {
        oldCentroids = [...centroids];
        centroids = updateCentroids(dots, dotCentroidMap, centroids.length);

        if (centroidsEqual(oldCentroids, centroids)) {
            break;
        }

        dotCentroidMap = assignDotsToCentroids(dots, centroids);
        drawDots();

        for (let i = 0; i < dotCentroidMap.length; i++) {
            drawDot(dots[i][0], dots[i][1], colors[dotCentroidMap[i]]);
        }
    }

    return {dotCentroidMap, centroids};
}

function updateCentroids(dots, dotCentroidMap, centroidCount) {
    const centroids = [];
    const centroidCounts = new Array(centroidCount).fill(0);

    for (let i = 0; i < centroidCount; i++) {
        centroids.push([0, 0]);
    }

    for (let i = 0; i < dots.length; i++) {
        const centroidIndex = dotCentroidMap[i];
        centroids[centroidIndex][0] += dots[i][0];
        centroids[centroidIndex][1] += dots[i][1];
        centroidCounts[centroidIndex]++;
    }

    for (let i = 0; i < centroidCount; i++) {
        if (centroidCounts[i] > 0) {
            centroids[i][0] /= centroidCounts[i];
            centroids[i][1] /= centroidCounts[i];
        } else {
            centroids[i] = dots[Math.floor(Math.random() * dots.length)];
        }
    }

    return centroids;
}

//Вычисляем дистанцию от каждой точки, до ближайшего центройда, а после выбираем точку с максимальным расстоянием-
//она становится новым центроидом
function kMeansPlusPlus(dots, k) {
    const centroids = [dots[Math.floor(Math.random() * dots.length)]];
    while (centroids.length < k) {
        let maxDistance = 0;
        let nextCentroid = null;

        for (let i = 0; i < dots.length; i++) {
            const distance = distanceToClosestCentroid(dots[i], centroids);

            if (distance > maxDistance) {
                maxDistance = distance;
                nextCentroid = dots[i];
            }
        }

        centroids.push(nextCentroid);
    }
    return centroids;
}

//Присваиваее каждую точку данных из массива dots ближайшему центроиду из массива centroids. Возвращает массив индексов ближайших центроидов для каждой точки.
function distanceToClosestCentroid(dot, centroids) {
    let minDistance = Infinity;

    for (let i = 0; i < centroids.length; i++) {
        const distance = Math.sqrt((dot[0] - centroids[i][0]) ** 2 + (dot[1] - centroids[i][1]) ** 2);

        if (distance < minDistance) {
            minDistance = distance;
        }
    }

    return minDistance;
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

function centroidsEqual(centroids1, centroids2) {
    if (centroids1.length !== centroids2.length) {
        return false;
    }

    for (let i = 0; i < centroids1.length; i++) {
        if (centroids1[i][0] !== centroids2[i][0] || centroids1[i][1] !== centroids2[i][1]) {
            return false;
        }
    }

    return true;
}


function drawDot(x, y, color) {
    firstContext.beginPath();
    firstContext.fillStyle = color;
    firstContext.arc(x, y, 10, 0, Math.PI * 2);
    firstContext.fill();
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

