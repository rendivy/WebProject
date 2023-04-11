import {startAlgorithm} from "./algorithm.js";

export {
    Chromosome,
    drawEdges,
    drawVertices,
    clearCanvas
}
export let vertexArray = [];
export let adjacencyMatrix = [];
export let isRunning = false;
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let currentNumber = 0;
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

function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

canvas.addEventListener("click", function(event) {
    if (isRunning && document.getElementById('launch').disabled !== true) {
        isRunning = false;
        resizeCanvas();
        drawVertices();
    }
    else if (isRunning) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    vertexArray.push(new Vertex(x,y));
    currentNumber++;
    drawVertex(x, y, currentNumber);
});

document.getElementById('launch').addEventListener("click", () => {
    isRunning = true;
    document.getElementById('launch').disabled = true;
    document.getElementById('clear').disabled = true;
    startAlgorithm();
});

document.getElementById('clear').addEventListener('click', () => {
    vertexArray = [];
    adjacencyMatrix = [];
    currentNumber = 0;
    resizeCanvas();
})

function drawVertex(x, y, number) {
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fillStyle = "orange";
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "white";
    ctx.font = "bold 15px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(number, x, y);
}

function drawEdges(route, color) {
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(vertexArray[route[0]].x,vertexArray[route[0]].y);
    for (let i = 1; i < route.length; i++) {
        ctx.lineTo(vertexArray[route[i]].x,vertexArray[route[i]].y);
    }
    ctx.lineTo(vertexArray[route[0]].x,vertexArray[route[0]].y);
    ctx.stroke();
}



function drawVertices() {
    for (let i = 0; i < vertexArray.length; i++) {
        drawVertex(vertexArray[i].x,vertexArray[i].y, i + 1);
    }
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

resizeCanvas();
