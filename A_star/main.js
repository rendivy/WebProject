import {generateMaze} from "./mazeGeneration.js"
import {bfs} from "./algorithm.js";

import {
  table,
  size,
  start,
  finish,
  createTable
} from "./fieldCreation.js";

import {
  pressedButtons
} from "./mazeTransformations.js";

document.getElementById('change_size_button').addEventListener('click', () => {

  pressedButtons.isBuilt = false;
  pressedButtons.isChangeStart = false;
  pressedButtons.isChangeFinish = false;
  pressedButtons.isMatrixEditing = false;

  const newSize = parseInt(document.getElementById('change_size_number').value);
  if (!isNaN(newSize) && newSize >= 5 && newSize <= 50) {
    document.querySelector('.table_container').removeChild(table);
    createTable(newSize);
  } else {
    alert("Значение должно быть от 5 до 50!")
  }
});

document.getElementById('generate_maze').addEventListener('click', () => {
  pressedButtons.isBuilt = false;
  pressedButtons.isChangeStart = false;
  pressedButtons.isChangeFinish = false;
  pressedButtons.isMatrixEditing = false;

  if (size != null) {
    generateMaze(table, size);
  }
});

document.getElementById('change_start').addEventListener('click', () => {
  if (pressedButtons.isBuilt) {
    pressedButtons.isBuilt = false;
    document.querySelector('.table_container').removeChild(table);
    createTable(size);
  }

  pressedButtons.isChangeFinish = false;
  pressedButtons.isChangeStart = true;
  pressedButtons.isMatrixEditing = false;
});

document.getElementById('change_finish').addEventListener('click', () => {
  if (pressedButtons.isBuilt) {
    pressedButtons.isBuilt = false;
    document.querySelector('.table_container').removeChild(table);
    createTable(size);
  }

  pressedButtons.isChangeFinish = true;
  pressedButtons.isChangeStart = false;
  pressedButtons.isMatrixEditing = false;
});

document.getElementById('clear').addEventListener('click', () => {
  pressedButtons.isBuilt = false;
  pressedButtons.isChangeStart = false;
  pressedButtons.isChangeFinish = false;
  pressedButtons.isMatrixEditing = false;

  document.querySelector('.table_container').removeChild(table);
  createTable(size);
});

document.getElementById('edit_maze').addEventListener('click', () => {
  if (pressedButtons.isBuilt) {
    pressedButtons.isBuilt = false;
    document.querySelector('.table_container').removeChild(table);
    createTable(size);
  }

  pressedButtons.isChangeStart = false;
  pressedButtons.isChangeFinish = false;
  pressedButtons.isMatrixEditing = true;
});

document.getElementById('launch').addEventListener('click', () => {
  pressedButtons.isChangeStart = false;
  pressedButtons.isChangeFinish = false;
  pressedButtons.isMatrixEditing = false;

  if (start.x != null && finish.x != null) {
    bfs();
    pressedButtons.isBuilt = true;
  }
})

createTable(size);
