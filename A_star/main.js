import {generateMaze} from "./mazeGeneration.js"
import {AStar} from "./algorithm.js";

import {
    table,
    size,
    start,
    finish,
    createTable
} from "./fieldCreation.js";

let isBuilt = false;
const tableContainer = document.querySelector('.table-container');


export const buttons = {
    generateMaze: document.getElementById('generate-maze'),
    changeStart: document.getElementById('change-start'),
    changeFinish: document.getElementById('change-finish'),
    clear: document.getElementById('clear'),
    editMaze: document.getElementById('edit-maze'),
    launch: document.getElementById('launch'),
    slider: document.getElementById("slider")
}

function setInactive() {
    buttons.changeStart.classList.remove('active');
    buttons.changeFinish.classList.remove('active');
    buttons.editMaze.classList.remove('active');
    isBuilt = false;
}


buttons.slider.addEventListener("input", () => {
    document.querySelector(".size-display span").textContent = `Размерность поля: ${buttons.slider.value}`;
    setInactive();
    tableContainer.removeChild(table);
    createTable(buttons.slider.value);
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
        AStar();
        isBuilt = true;
    }
})

createTable(size);
