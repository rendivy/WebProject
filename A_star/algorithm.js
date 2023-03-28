import {
  table, size, start, finish
} from "./fieldCreation.js";

import {
  finishColor, passColor, startColor, pathСolor, bypassableColor
} from "./colors.js";

function addEdges(graph, i, j) {
  if (j - 1 >= 0 && table && (
    table.rows[i].cells[j - 1].style.background == passColor ||
    table.rows[i].cells[j - 1].style.background == finishColor ||
    table.rows[i].cells[j - 1].style.background == startColor
  )) {
    graph[i][j].push({x: i, y: j - 1});
  }
  if (j + 1 < size && (
    table.rows[i].cells[j + 1].style.background == passColor ||
    table.rows[i].cells[j + 1].style.background == finishColor ||
    table.rows[i].cells[j + 1].style.background == startColor
  )) {
    graph[i][j].push({x: i, y: j + 1});
  }
  if (i - 1 >= 0 && (
    table.rows[i - 1].cells[j].style.background == passColor ||
    table.rows[i - 1].cells[j].style.background == finishColor ||
    table.rows[i - 1].cells[j].style.background == startColor
  )) {
    graph[i][j].push({x: i - 1, y: j});
  }
  if (i + 1 < size && (
    table.rows[i + 1].cells[j].style.background == passColor ||
    table.rows[i + 1].cells[j].style.background == finishColor ||
    table.rows[i + 1].cells[j].style.background == startColor
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
        table.rows[i].cells[j].style.background == passColor ||
        table.rows[i].cells[j].style.background == finishColor ||
        table.rows[i].cells[j].style.background == startColor
      ) {
        addEdges(graph, i, j);
      }
    }
  }
}


async function showTheWay(way, x, y) {
  for (let i = 0; i < way.length; i++) {
    if (
      !((way[i].x == start.x && way[i].y == start.y) ||
        (way[i].x == finish.x && way[i].y == finish.y))
    )
      table.rows[way[i].x].cells[way[i].y].style.background = pathСolor;
    await new Promise(resolve => setTimeout(resolve, 30));
  }
}

export async function bfs() {
  const graph = [];
  const q = [];
  const way = new Array(size * size);
  for (let i = 0; i < size * size; i++) {
    way[i] = [];
  }

  createGraph(graph);
  way[start.x * size + start.y].push(start);
  q.push(start);

  while (q.length != 0) {
    let current = q[0];
    q.shift();

    for (let i = 0; i < graph[current.x][current.y].length; i++) {
      let temp = graph[current.x][current.y][i];
      if (way[temp.x * size + temp.y].length == 0) {

        way[temp.x * size + temp.y] = way[current.x * size + current.y].slice();
        way[temp.x * size + temp.y].push(temp);
        q.push(temp);

        if (temp.x == finish.x && temp.y == finish.y) {
          showTheWay(way[temp.x * size + temp.y], temp.x, temp.y);
          return;
        }

        table.rows[temp.x].cells[temp.y].style.background = bypassableColor;
        await new Promise(resolve => setTimeout(resolve, 75));
      }
    }
  }

  alert("Пути нет!");
}
