import {
    vertexArray,
    adjacencyMatrix,
    Chromosome,
    drawEdges,
    clearCanvas,
    drawVertices
} from "./main.js";


export {
    startAlgorithm
};

let population = [];

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function getDistance(firstVertex, secondVertex) {
    return Math.sqrt(Math.pow(firstVertex.x - secondVertex.x, 2) + Math.pow(firstVertex.y - secondVertex.y, 2));
}

function getRouteLength(route) {
    let sm = 0;
    for (let i = 0; i < route.length - 1; i++) {
        sm += adjacencyMatrix[route[i]][route[i + 1]];
    }
    sm += adjacencyMatrix[route[route.length - 1]][route[0]];
    return sm;
}

function shuffle(array) {
    let currentIndex = array.length;
    let temporary, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = getRandomNumber(0, currentIndex - 1);
        currentIndex -= 1;
        temporary = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporary;
    }
    return array;
}

function adjMatrixGeneration(size) {
    for (let i = 0; i < size; i++) {
        adjacencyMatrix.push(new Array(size));
    }
    for (let i = 0; i < size; i++) {
        for (let j = i + 1; j < size; j++) {
            let distance = getDistance(vertexArray[i], vertexArray[j]);
            adjacencyMatrix[i][j] = distance;
            adjacencyMatrix[j][i] = distance;
        }
    }
}

function generatePopulation(size) {
    const vertex = [];
    for (let i = 0; i < vertexArray.length; i++) {
        vertex.push(i);
    }
    for (let i = 0; i < size; i++) {
        let temp = shuffle(vertex.slice());
        population.push(new Chromosome(temp, getRouteLength(temp)));
    }
}

function mutation(descendant) {
    let i = getRandomNumber(0, vertexArray.length - 1);
    let j = getRandomNumber(0, vertexArray.length - 1);
    while (i < j) {
        const temp = descendant[i];
        descendant[i] = descendant[j];
        descendant[j] = temp;
        i++;
        j--;
    }
}

function crossover(firstParent, secondParent) {
    let border = getRandomNumber(1, vertexArray.length - 2);
    const firstDescendant = firstParent.slice(0,border);
    const secondDescendant = secondParent.slice(0,border);
    for (let i = 0; i < firstParent.length; i++) {
        if (!secondDescendant.includes(firstParent[i])) {
            secondDescendant.push(firstParent[i]);
        }
        if (secondDescendant.length === firstParent.length) {
            break;
        }
    }
    for (let i = 0; i < secondParent.length; i++) {
        if (!firstDescendant.includes(secondParent[i])) {
            firstDescendant.push(secondParent[i]);
        }
        if (firstDescendant.length === secondParent.length) {
            break;
        }
    }
    mutation(firstDescendant);
    mutation(secondDescendant);
    population.push(new Chromosome(firstDescendant,getRouteLength(firstDescendant)));
    population.push(new Chromosome(secondDescendant,getRouteLength(secondDescendant)));
}

function produceNextGeneration(populationSize) {
    let i = 0;
    while (i !== Math.floor(populationSize / 2)) {
        let firstParent = getRandomNumber(0, populationSize - 1);
        let secondParent = getRandomNumber(0, populationSize - 1);
        while (firstParent !== secondParent) {
            firstParent = getRandomNumber(0, populationSize - 1);
            secondParent = getRandomNumber(0, populationSize - 1);
        }
        crossover(population[firstParent].route,population[secondParent].route);
        i++;
    }
    population.sort((a, b) => a.fitness - b.fitness);
    population.splice(Math.ceil(population.length / 2));
}

function startAlgorithm() {
    let populationSize = vertexArray.length * vertexArray.length;
    population = [];
    adjMatrixGeneration(vertexArray.length);
    generatePopulation(populationSize);
    let i = 0;
    let previous = population[0].fitness;
    const intervalId = setInterval(() => {

        if (i >= 250) {
            clearInterval(intervalId);
            clearCanvas();
            drawEdges(population[0].route, 'deepskyblue');
            drawVertices();
            document.getElementById('launch').disabled = false;
            document.getElementById('clear').disabled = false;
            return;
        }

        produceNextGeneration(populationSize);

        if (previous !== population[0].fitness) {
            previous = population[0].fitness;
            clearCanvas();
            drawEdges(population[0].route, 'gray');
            drawVertices();
        }

        i++;
    }, 10);
}
