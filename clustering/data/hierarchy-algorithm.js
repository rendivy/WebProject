
const hierarchical = (points, countOfClusters) => {
    let groups = points.map((element, index) => {
        return [index];
    });
    let countOfClustersNow = points.length;
    let nextSwap = {firstElement: -1, secondElement: -1, minDistance: Infinity};
    while (countOfClustersNow > countOfClusters) {
        nextSwap = {firstElement: -1, secondElement: -1, minDistance: Infinity};
        groups.forEach((element, index) => {
            groups.forEach((element2, index2) => {
                if (index < index2) {
                    let middleOfFirstGroup = element.reduce((acc, curr) => [acc[0] + points[curr][0], acc[1] + points[curr][1]], [0, 0]);
                    middleOfFirstGroup[0] /= element.length;
                    middleOfFirstGroup[1] /= element.length;

                    let middleOfSecondGroup = element2.reduce((acc, curr) => [acc[0] + points[curr][0], acc[1] + points[curr][1]], [0, 0]);
                    middleOfSecondGroup[0] /= element2.length;
                    middleOfSecondGroup[1] /= element2.length;

                    //вычисление максимальной дистанции
                    if (getDistance(middleOfFirstGroup, middleOfSecondGroup) < nextSwap.minDistance) {
                        nextSwap.firstElement = index;
                        nextSwap.secondElement = index2;
                        nextSwap.minDistance = getDistance(
                            middleOfFirstGroup,
                            middleOfSecondGroup
                        );
                    }
                }
            });
        });
        groups[nextSwap.firstElement].push(...groups[nextSwap.secondElement]);
        groups[nextSwap.secondElement].length = 0;
        countOfClustersNow--;
    }
    let newGroups = [];
    groups.forEach((element) => {
        if (element.length) newGroups.push(element);
    });
    return newGroups;
};


const getDistance = (firstElement, secondElement) =>
    Math.sqrt(
        Math.pow(firstElement[0] - secondElement[0], 2) +
        Math.pow(firstElement[1] - secondElement[1], 2)
    );



function runHierarchyAlgorithm(){
    let newGroups = hierarchical(points, hierarchySlider.value)
    const colors = new Array(newGroups.length).fill(null).map(getRandomColor);
    newGroups.forEach((cluster, i) => {
        const color = colors[i];
        paintCluster(cluster, color);
    });
}


const paintCluster = (indexes, color) => {
    thirdContext.fillStyle = color;
    indexes.forEach((index) => {
        const [x, y] = points[index];
        thirdContext.beginPath();
        thirdContext.arc(x, y, 10, 0, 2 * Math.PI);
        thirdContext.fill();
    });
};

