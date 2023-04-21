import {passColor, wallColor} from "./colors.js";
import {buttons} from "./main.js";

import {
    chooseStart,
    chooseFinish,
    editMaze
} from "./mazeTransformations.js";

export let table = null;
export let size = 9;
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
            cell.style.border = '1px solid gray';

            cell.addEventListener('click', () => {
                if (buttons.changeStart.classList.contains('active')) {
                    chooseStart(i, j);
                } else if (buttons.changeFinish.classList.contains('active')) {
                    chooseFinish(i, j);
                } else if (buttons.editMaze.classList.contains('active')) {
                    editMaze(i, j);
                }
            });

            cell.addEventListener('mouseover', () => {
                if (buttons.changeStart.classList.contains('active') && cell.style.background === passColor) {
                    cell.classList.add('change-start-hover');
                } else if (buttons.changeFinish.classList.contains('active') && cell.style.background === passColor) {
                    cell.classList.add('change-finish-hover');
                } else if (buttons.editMaze.classList.contains('active')) {
                    if (cell.style.background === passColor) {
                        cell.classList.add('edit-cell-hover');
                    } else if (cell.style.background === wallColor) {
                        cell.classList.add('edit-wall-hover');
                    }
                }
            });

            cell.addEventListener('mouseout', () => {
                if (buttons.changeStart.classList.contains('active')) {
                    cell.classList.remove('change-start-hover');
                } else if (buttons.changeFinish.classList.contains('active')) {
                    cell.classList.remove('change-finish-hover');
                } else if (buttons.editMaze.classList.contains('active')) {
                    cell.classList.remove('edit-wall-hover');
                    cell.classList.remove('edit-cell-hover');
                }
            });

            row.appendChild(cell);
        }
        table.appendChild(row);
    }
    document.querySelector('.table-container').appendChild(table);
}
