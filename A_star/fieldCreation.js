import {passColor} from "./colors.js";

import {
  pressedButtons,
  chooseStart,
  chooseFinish,
  editMaze
} from "./mazeTransformations.js";

export let table = null;
export let size = 10;
export let start = {x: null, y: null};
export let finish = {x: null, y: null}


export function createTable(sizeTable) {
  start.x = null;
  start.y = null;
  finish.x = null;
  finish.y = null;

  size = sizeTable;
  table = document.createElement('table');
  table.id = 'table'
  table.style.width = '100%';
  table.style.height = '100%';
  table.style.borderCollapse = 'collapse';

  for (let i = 0; i < size; i++) {
    const row = document.createElement('tr');
    for (let j = 0; j < size; j++) {
      const cell = document.createElement('td');
      cell.style.background = passColor;
      cell.style.width = `${100 / size}%`;
      cell.style.height = `${100 / size}%`;
      cell.style.border = '2px solid black';
      cell.addEventListener('click', () => {
        if (pressedButtons.isChangeStart) {
          chooseStart(i, j);
        } else if (pressedButtons.isChangeFinish) {
          chooseFinish(i, j);
        } else if (pressedButtons.isMatrixEditing) {
          editMaze(i, j);
        }
      });
      row.appendChild(cell);
    }
    table.appendChild(row);
  }
  document.querySelector('.table_container').appendChild(table);
}
