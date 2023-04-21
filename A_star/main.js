import {generateMaze} from "./mazeGeneration.js"
import {aStar} from "./algorithm.js";

import {
    table,
    size,
    start,
    finish,
    createTable
} from "./fieldCreation.js";

let isBuilt = false;
export const delay = {value: 60};
const tableContainer = document.querySelector('.table-container');
const speedChange = document.getElementById('speed-change')

export const buttons = {
    generateMaze: document.getElementById('generate-maze'),
    changeStart: document.getElementById('change-start'),
    changeFinish: document.getElementById('change-finish'),
    clear: document.getElementById('clear'),
    editMaze: document.getElementById('edit-maze'),
    launch: document.getElementById('launch'),
    fieldResizing: document.getElementById("field-resizing"),
}

function setInactive() {
    buttons.changeStart.classList.remove('active');
    buttons.changeFinish.classList.remove('active');
    buttons.editMaze.classList.remove('active');
    isBuilt = false;
}


speedChange.addEventListener("input", () => {
    document.querySelector(".delay").textContent = `Задержка: ${speedChange.value}`;
    delay.value = speedChange.value * 3;
});
buttons.fieldResizing.addEventListener("input", () => {
    setInactive();
    tableContainer.removeChild(table);
    createTable(buttons.fieldResizing.value);
});


buttons.generateMaze.addEventListener('click', () => {
    setInactive();
    if (size != null) {
        generateMaze(table, size);
    }
});

buttons.changeStart.addEventListener('click', () => {
    if (isBuilt) {
        tableContainer.removeChild(table);
        createTable(size);
    }

    setInactive();
    buttons.changeStart.classList.add('active');
});

buttons.changeFinish.addEventListener('click', () => {
    if (isBuilt) {
        tableContainer.removeChild(table);
        createTable(size);
    }

    setInactive();
    buttons.changeFinish.classList.add('active');
});

buttons.editMaze.addEventListener('click', () => {
    if (isBuilt) {
        tableContainer.removeChild(table);
        createTable(size);
    }

    setInactive();
    buttons.editMaze.classList.add('active');
});

buttons.clear.addEventListener('click', () => {
    setInactive();

    tableContainer.removeChild(table);
    createTable(size);
});

buttons.launch.addEventListener('click', () => {
    buttons.changeStart.classList.remove('active');
    buttons.changeFinish.classList.remove('active');
    buttons.editMaze.classList.remove('active');

    if (start.x != null && finish.x != null && !isBuilt) {
        aStar();
        isBuilt = true;
    }
})

createTable(size);
