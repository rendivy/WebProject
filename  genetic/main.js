import {startAlgorithm} from "./algorithm.js";

export {
    Chromosome,
    drawEdges,
    drawVertices,
    clearCanvas
}

export const buttons = {
    addVertex: document.getElementById('add-vertex'),
    removeVertex: document.getElementById('remove-vertex'),
    clear: document.getElementById('clear'),
    launch: document.getElementById('launch'),
}

export let vertexArray = [];
export let isRunning = false;


const text = document.getElementById("change-size");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const radius = 14;

let currentSize = 0;

class Chromosome {
    constructor(route, fitness) {
        this.route = route;
        this.fitness = fitness;
    }
}

class Vertex {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

/***** Canvas *****/

function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function clearVertex(x, y) {
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(x, y, radius + 1, 0, Math.PI * 2);
    ctx.fill();
}

function drawVertex(x, y) {
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawEdges(route, color) {
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(vertexArray[route[0]].x, vertexArray[route[0]].y);
    for (let i = 1; i < route.length; i++) {
        ctx.lineTo(vertexArray[route[i]].x, vertexArray[route[i]].y);
    }
    ctx.lineTo(vertexArray[route[0]].x, vertexArray[route[0]].y);
    ctx.stroke();
}


function drawVertices() {
    for (let i = 0; i < currentSize; i++) {
        drawVertex(vertexArray[i].x, vertexArray[i].y, i + 1);
    }
}


/* --------------------- */

document.addEventListener("DOMContentLoaded", () => {
    buttons.addVertex.classList.add('active');
});


canvas.addEventListener("click", (event) => {
    if (isRunning && document.getElementById('launch').disabled !== true) {
        isRunning = false;
        resizeCanvas();
        drawVertices();
    } else if (isRunning) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (buttons.addVertex.classList.contains('active')) {
        for (let i = 0; i < currentSize; i++) {
            const vertex = vertexArray[i];
            const distance = Math.sqrt((x - vertex.x) ** 2 + (y - vertex.y) ** 2);
            if (distance <= radius * 2) return;
        }
        currentSize++;
        text.textContent = `Количество вершин: ${currentSize}`;
        vertexArray.push(new Vertex(x, y));
        drawVertex(x, y);
    } else {
        for (let i = 0; i < currentSize; i++) {
            const vertex = vertexArray[i];
            const distance = Math.sqrt((x - vertex.x) ** 2 + (y - vertex.y) ** 2);
            if (distance <= radius) {
                clearVertex(vertex.x, vertex.y);
                vertexArray.splice(i, 1);
                currentSize--;
                text.textContent = `Количество вершин: ${currentSize}`;
                break;
            }
        }
    }

});

buttons.launch.addEventListener("click", () => {
    if (currentSize < 2) return;
    isRunning = true;
    document.getElementById('launch').disabled = true;
    document.getElementById('clear').disabled = true;
    startAlgorithm(currentSize);
});

buttons.clear.addEventListener('click', () => {
    text.textContent = `Количество вершин: 0`;
    currentSize = 0;
    vertexArray = [];
    isRunning = false;
    resizeCanvas();
});


buttons.addVertex.addEventListener('click', () => {
    buttons.removeVertex.classList.remove('active');
    buttons.addVertex.classList.add('active');
});

buttons.removeVertex.addEventListener('click', () => {
    buttons.addVertex.classList.remove('active');
    buttons.removeVertex.classList.add('active');
});

resizeCanvas();
