import {buttons} from "./main.js";

import {
    table,
    size,
    start,
    finish
} from "./fieldCreation.js";

import {
    finishColor,
    passColor,
    startColor,
    pathColor,
    bypassableColor,
    currentColor
} from "./colors.js";

function heuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function getLowestFValue(set, map) {
    let lowest = set[0];
    for (let i = 1; i < set.length; i++) {
        if (map.get(set[i]) < map.get(lowest)) {
            lowest = set[i];
        }
    }
    return lowest;
}

function addEdges(graph, i, j) {
    if (j - 1 >= 0 && table && (
        table.rows[i].cells[j - 1].style.background === passColor ||
        table.rows[i].cells[j - 1].style.background === finishColor ||
        table.rows[i].cells[j - 1].style.background === startColor
    )) {
        graph[i][j].push({x: i, y: j - 1});
    }
    if (j + 1 < size && (
        table.rows[i].cells[j + 1].style.background === passColor ||
        table.rows[i].cells[j + 1].style.background === finishColor ||
        table.rows[i].cells[j + 1].style.background === startColor
    )) {
        graph[i][j].push({x: i, y: j + 1});
    }
    if (i - 1 >= 0 && (
        table.rows[i - 1].cells[j].style.background === passColor ||
        table.rows[i - 1].cells[j].style.background === finishColor ||
        table.rows[i - 1].cells[j].style.background === startColor
    )) {
        graph[i][j].push({x: i - 1, y: j});
    }
    if (i + 1 < size && (
        table.rows[i + 1].cells[j].style.background === passColor ||
        table.rows[i + 1].cells[j].style.background === finishColor ||
        table.rows[i + 1].cells[j].style.background === startColor
    )) {
        graph[i][j].push({x: i + 1, y: j});
    }
}

function createGraph(graph) {
    for (let i = 0; i < size; i++) {
        graph.push([]);
        for (let j = 0; j < size; j++) {
            graph[i].push([]);
            if (
                table.rows[i].cells[j].style.background === passColor ||
                table.rows[i].cells[j].style.background === finishColor ||
                table.rows[i].cells[j].style.background === startColor
            ) {
                addEdges(graph, i, j);
            }
        }
    }
}


export async function AStar() {

    for (let i of Object.values(buttons)) {
        i.disabled = true;
    }

    const graph = [];
    const queue = [];
    const fValues = new Map();
    const ways = new Array(size * size);
    for (let i = 0; i < size * size; i++) {
        ways[i] = [];
    }

    createGraph(graph);
    ways[start.x * size + start.y].push(start);
    queue.push(start);

    while (queue.length) {
        let current = getLowestFValue(queue, fValues);
        queue.splice(queue.indexOf(current), 1);

        for (let i = 0; i < graph[current.x][current.y].length; i++) {
            let neighbor = graph[current.x][current.y][i];

            if (ways[neighbor.x * size + neighbor.y].length === 0) {

                ways[neighbor.x * size + neighbor.y] = ways[current.x * size + current.y].slice();
                ways[neighbor.x * size + neighbor.y].push(neighbor);
                queue.push(neighbor);

                if (neighbor.x === finish.x && neighbor.y === finish.y) {
                    let route = ways[neighbor.x * size + neighbor.y];
                    for (let i = 0; i < route.length; i++) {
                        if (
                            !((route[i].x === start.x && route[i].y === start.y) ||
                                (route[i].x === finish.x && route[i].y === finish.y))
                        )
                            table.rows[route[i].x].cells[route[i].y].style.background = pathColor;
                        await new Promise(resolve => setTimeout(resolve, 30));
                    }

                    for (let i of Object.values(buttons)) {
                        i.disabled = false;
                    }

                    return;
                }

                fValues.set(neighbor, ways[current.x * size + current.y].length + 1 + heuristic(neighbor, finish));
                table.rows[neighbor.x].cells[neighbor.y].style.background = currentColor;
                await new Promise(resolve => setTimeout(resolve, 60));
                table.rows[neighbor.x].cells[neighbor.y].style.background = bypassableColor;
            }
        }
    }

    for (let i of Object.values(buttons)) {
        i.disabled = false;
    }


    alert("Пути нет!");
}

