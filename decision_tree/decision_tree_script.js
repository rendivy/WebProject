import { validateDataSet } from "./validate.js";
import { parseCSV } from "./parseCSV.js";
import { DataSetEntity } from './Entity/DataSetEntity.js';
import { Node } from './DecisionTree.js';

function getDistance(x1, x2, y1, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function draw(element, element2, index) {
    const line = document.createElement("div");
    const number = document.createElement("div");

    const length = getDistance(element.x, element2.x, element.y, element2.y);
    let sin =
        (Math.asin(Math.abs(element.y - element2.y) / length) * 180) / Math.PI;
    let cos =
        (Math.acos(Math.abs(element.y - element2.y) / length) * 180) / Math.PI;

    number.style.left = `${element.x}px`;
    number.style.top = `${element.y - 18}px`;
    if (element.x <= element2.x && element.y <= element2.y) {
        line.style.transform = `rotate(${sin}deg)`;
    } else if (element.x <= element2.x && element.y >= element2.y) {
        line.style.transform = `rotate(${360 - sin}deg)`;
    } else if (element.x >= element2.x && element.y >= element2.y) {
        line.style.transform = `rotate(${sin + 180}deg)`;
    } else {
        line.style.transform = `rotate(${cos + 90}deg)`;
    }

    line.style.width = `${length}px`;
    line.style.left = `${element.x + 3}px`;
    line.style.top = `${element.y + 3}px`;
    line.classList.add("ant-algorithm__line");

    number.innerText = index;
    number.classList.add("ant-algorithm__index");

    sheet.append(line);
    sheet.append(number);
}

let dataSet;
let root;
const treeBlock = document.querySelector('.tree');

function createTree(node, level) {
    //const level = document.createElement('div');
    for (let i = 0; i < node.branches.length; i++) {
        const element = document.createElement('div');
        element.innerHTML = node.branches[i].nodeName;
        element.classList.add('tree__element');
        level.appendChild(element);
        treeBlock.appendChild(level);
        const coords1 = {x: node.clientX -
                Math.ceil(event.currentTarget.getBoundingClientRect().x) +
                1}
    }
    const newLevel = document.createElement('div');
    newLevel.classList.add('tree__level');
    for (let i = 0; i < node.branches.length; i++) {
        createTree(node.branches[i], newLevel);
    }
}

document.getElementById('build-tree').onclick = function ()
{
    root.buildTree(root);
    const level = document.createElement('div');
    const element = document.createElement('div');
    element.innerHTML = root.nodeName;
    element.classList.add('tree__element');
    level.appendChild(element);
    level.classList.add('tree__level');
    treeBlock.appendChild(level);
    const newLevel = document.createElement('div');
    newLevel.classList.add('tree__level');
    createTree(root, newLevel);
}

document.getElementById('predict').onclick = function ()
{
    console.log(root.predict(root, ["Выше","Дома","На месте","Нет"]));
}

document.getElementById('pruning').onclick = function ()
{

}

document.getElementById('clear').onclick = function ()
{

}

document.getElementById('file-upload-input').onchange = function ()
{
    let file = document.getElementById('file-upload-input').files[0];
    let reader = new FileReader();
    reader.onload = function(e) {
        let text = reader.result;
        let parsed = parseCSV(text);
        if(parsed === null){
            console.log("File is not CSV");
            return;
        }
        if(parsed.length === 0){
            console.log("File is empty");
            return;
        }
        if(parsed.length <= 2){
            console.log("Invalid Signature");
            return;
        }
        dataSet = new DataSetEntity(parsed, parsed[0].length - 1, []);
        let errors = validateDataSet(dataSet);
        if (errors.length !== 0) {
            console.log("DataSet - ERROR");
            return;
        } else {
            console.log("DataSet - OK");
        }
        root = new Node("root",null, dataSet, null, -1, null, -1);
    };
    reader.readAsText(file);
}
