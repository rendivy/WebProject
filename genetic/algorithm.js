import {
    buttons,
    vertexArray,
    Chromosome,
    drawEdges,
    clearCanvas,
    drawVertices
} from "./main.js";


export {
    startAlgorithm
};


const mutationProbability = 0.7;
const maximumGenerations = 15000;
const generationsUnchanged = 450;


let population = [];
let adjacencyMatrix = [];

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
    let firstIndex, secondIndex, temporary;
    for (let i = 0; i < array.length; i++) {
        firstIndex = getRandomNumber(0, array.length - 1);
        secondIndex = getRandomNumber(0, array.length - 1);
        temporary = array[firstIndex];
        array[firstIndex] = array[secondIndex];
        array[secondIndex] = temporary;
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
    const firstDescendant = firstParent.slice(0, border);
    const secondDescendant = secondParent.slice(0, border);

    for (let i = border; i < firstParent.length; i++) {
        if (!firstDescendant.includes(secondParent[i])) {
            firstDescendant.push(secondParent[i]);
        }
        if (!secondDescendant.includes(firstParent[i])) {
            secondDescendant.push(firstParent[i]);
        }
    }
    for (let i = border; i < firstParent.length; i++) {
        if (!firstDescendant.includes(firstParent[i])) {
            firstDescendant.push(firstParent[i]);
        }
        if (!secondDescendant.includes(secondParent[i])) {
            secondDescendant.push(secondParent[i]);
        }
    }

    if (Math.random() >= mutationProbability) {
        mutation(firstDescendant);
    }
    if (Math.random() >= mutationProbability) {
        mutation(secondDescendant);
    }

    population.push(new Chromosome(firstDescendant, getRouteLength(firstDescendant)));
    population.push(new Chromosome(secondDescendant, getRouteLength(secondDescendant)));
}

function produceNextGeneration(populationSize) {
    let i = 0;

    while (i < populationSize) {
        let firstParent = getRandomNumber(0, populationSize - 1);
        let secondParent = getRandomNumber(0, populationSize - 1);
        crossover(population[firstParent].route, population[secondParent].route);
        i += 2;
    }

    population.sort((a, b) => a.fitness - b.fitness);
    population.splice(Math.ceil(population.length / 2));
}

function startAlgorithm(currentSize) {

    for (let i of Object.values(buttons)) {
        i.disabled = true;
    }

    const populationSize = currentSize * currentSize;
    adjacencyMatrix = [];
    population = [];

    adjMatrixGeneration(currentSize);
    generatePopulation(populationSize);

    let total = 0;
    let withoutChanges = 0;

    const currentMaxChromosome = population.reduce((max, current) => {
        return (current.fitness > max.fitness) ? current : max;
    });
    clearCanvas();
    drawEdges(currentMaxChromosome.route, 'gray');
    drawVertices();
    let previous = currentMaxChromosome.fitness

    const intervalId = setInterval(() => {

        if (total === maximumGenerations || withoutChanges === generationsUnchanged || withoutChanges === populationSize) {
            clearInterval(intervalId);
            clearCanvas();
            drawEdges(population[0].route, 'deepskyblue');
            drawVertices();

            for (let i of Object.values(buttons)) {
                i.disabled = false;
            }

            return;
        }

        produceNextGeneration(populationSize);

        if (previous !== population[0].fitness) {
            previous = population[0].fitness;
            clearCanvas();
            drawEdges(population[0].route, 'gray');
            drawVertices();
            withoutChanges = 0
        }

        withoutChanges++;
        total++;
    }, 0);
}
