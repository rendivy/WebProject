import {
  wallColor,
  passColor,
} from "./colors.js";

import {
  start,
  finish
} from "./fieldCreation.js";

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function generateMaze(table, size) {
  start.x = null;
  start.y = null;
  finish.x = null;
  finish.y = null;

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      table.rows[i].cells[j].style.background = wallColor;
    }
  }

  let x = getRandomNumber(0, size - 1);
  let y = getRandomNumber(0, size - 1);

  table.rows[x].cells[y].style.background = passColor;
  const followingCells = [];
  if (y - 2 >= 0) {
    followingCells.push({x: x, y: y - 2});
  }
  if (y + 2 < size) {
    followingCells.push({x: x, y: y + 2});
  }
  if (x - 2 >= 0) {
    followingCells.push({x: x - 2, y: y});
  }
  if (x + 2 < size) {
    followingCells.push({x: x + 2, y: y});
  }

  while (followingCells.length > 0) {
    let index = getRandomNumber(0, followingCells.length - 1);
    let cell = followingCells[index];

    if (table.rows[cell.x].cells[cell.y].style.background === passColor) {
      followingCells.splice(index, 1);
      continue;
    }

    table.rows[cell.x].cells[cell.y].style.background = passColor;
    followingCells.splice(index, 1);

    const direction = {
      LEFT: 1,
      RIGHT: 2,
      DOWN: 3,
      UP: 4
    };

    const d = [direction.LEFT, direction.RIGHT, direction.DOWN, direction.UP];

    outerLoop:
      while (d.length > 0) {
        let index = getRandomNumber(0, d.length - 1);
        switch (d[index]) {
          case direction.LEFT:
            if (cell.y - 2 >= 0 && table.rows[cell.x].cells[cell.y - 2].style.background === passColor) {
              table.rows[cell.x].cells[cell.y - 1].style.background = passColor;
              break outerLoop;
            }
            break;
          case direction.RIGHT:
            if (cell.y + 2 < size && table.rows[cell.x].cells[cell.y + 2].style.background === passColor) {
              table.rows[cell.x].cells[cell.y + 1].style.background = passColor;
              break outerLoop;
            }
            break;
          case direction.UP:
            if (cell.x - 2 >= 0 && table.rows[cell.x - 2].cells[cell.y].style.background === passColor) {
              table.rows[cell.x - 1].cells[cell.y].style.background = passColor;
              break outerLoop;
            }
            break;
          case direction.DOWN:
            if (cell.x + 2 < size && table.rows[cell.x + 2].cells[cell.y].style.background === passColor) {
              table.rows[cell.x + 1].cells[cell.y].style.background = passColor;
              break outerLoop;
            }
            break;
        }
        d.splice(index, 1);
      }

    if (cell.y - 2 >= 0 && table.rows[cell.x].cells[cell.y - 2].style.background === wallColor) {
      followingCells.push({x: cell.x, y: cell.y - 2});
    }
    if (cell.y + 2 < size && table.rows[cell.x].cells[cell.y + 2].style.background === wallColor) {
      followingCells.push({x: cell.x, y: cell.y + 2});
    }
    if (cell.x - 2 >= 0 && table.rows[cell.x - 2].cells[cell.y].style.background === wallColor) {
      followingCells.push({x: cell.x - 2, y: cell.y});
    }
    if (cell.x + 2 < size && table.rows[cell.x + 2].cells[cell.y].style.background === wallColor) {
      followingCells.push({x: cell.x + 2, y: cell.y});
    }
  }
}
