import {
    finishColor,
    passColor,
    startColor,
    wallColor
} from "./colors.js";

import {
    finish,
    start,
    table
} from "./fieldCreation.js";

export function chooseStart(i, j) {
    if (table.rows[i].cells[j].style.background !== passColor) return;
    if (start.x == null && start.y == null) {
        table.rows[i].cells[j].style.background = startColor;
        start.x = i;
        start.y = j;
    } else {
        table.rows[start.x].cells[start.y].style.background = passColor;
        table.rows[i].cells[j].style.background = startColor;
        start.x = i;
        start.y = j;
    }
}

export function chooseFinish(i, j) {
    if (table.rows[i].cells[j].style.background !== passColor) return;
    if (finish.x == null && finish.y == null) {
        table.rows[i].cells[j].style.background = finishColor;
        finish.x = i;
        finish.y = j;
    } else {
        table.rows[finish.x].cells[finish.y].style.background = passColor;
        table.rows[i].cells[j].style.background = finishColor;
        finish.x = i;
        finish.y = j;
    }
}

export function editMaze(i, j) {
    if (table.rows[i].cells[j].style.background === passColor) {
        table.rows[i].cells[j].style.background = wallColor;
    } else if (table.rows[i].cells[j].style.background === wallColor) {
        table.rows[i].cells[j].style.background = passColor;
    }
}
