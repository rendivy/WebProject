import { validateDataSet } from "./validate.js";
import { parseCSV } from "./parseCSV.js";
import { DataSetEntity } from './Entity/DataSetEntity.js';
import { Node } from './DecisionTree.js';

let dataSetTeaching = undefined;
let dataSet = undefined;
let root = undefined;
const SPLIT_COEFICIENT = 0.8;
const treeBlock = document.querySelector('.tree');

document.getElementById('build-tree').onclick = function ()
{
    root.buildTree(root);
    renderTree(root, treeBlock);
    renderLines(root);
}

document.getElementById('predict').onclick = function ()
{
    console.log(root.predict(root, ["Выше","Дома","На месте","Нет"]));
}

document.getElementById('pruning').onclick = function ()
{
    treeBlock.innerHTML = "";
    root.pruningTree(root, dataSetTeaching);
    renderTree(root, treeBlock);
    renderLines(root);
}

document.getElementById('clear').onclick = function ()
{
    treeBlock.innerHTML = "";
    dataSet = null;
    dataSetTeaching = null;
    root = null;
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
        let split = splitDataSet(parsed);
        dataSet = new DataSetEntity(split.mainArray, parsed[0].length - 1, []);
        dataSetTeaching = new DataSetEntity(split.teachingArray, parsed[0].length - 1, []);
        let errors = validateDataSet(dataSet);
        if (errors.length !== 0) {
            console.log("DataSet - ERROR");
            console.log(errors);
            return;
        } else {
            console.log("DataSet - OK");
        }
        root = new Node("root",null, dataSet, null, -1, null, -1);
    };
    reader.readAsText(file);
}

function getDistance(x1, x2, y1, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function draw(element, element2, parameter) {
    const line = document.createElement("div");
    const number = document.createElement("div");
    const length = getDistance(element.x, element2.x, element.y, element2.y);
    let sin =
        (Math.asin(Math.abs(element.y - element2.y) / length) * 180) / Math.PI;
    let cos =
        (Math.acos(Math.abs(element.y - element2.y) / length) * 180) / Math.PI;

    if (element.x <= element2.x && element.y <= element2.y) {
        line.style.transform = `rotate(${sin}deg)`;
        number.style.transform = `rotate(${sin}deg)`;
    } else if (element.x <= element2.x && element.y >= element2.y) {
        line.style.transform = `rotate(${360 - sin}deg)`;
        number.style.transform = `rotate(${360 - sin}deg)`;
    } else if (element.x >= element2.x && element.y >= element2.y) {
        line.style.transform = `rotate(${sin + 180}deg)`;
        number.style.transform = `rotate(${sin + 180}deg)`;
    } else {
        line.style.transform = `rotate(${cos + 90}deg)`;
        number.style.transform = `rotate(${cos + 90}deg)`;
    }

    line.style.width = `${length}px`;
    line.style.left = `${element.x}px`;
    line.style.top = `${element.y}px`;
    line.classList.add("line");

    number.classList.add("number");
    number.innerHTML = parameter;
    number.style.left = `${(element.x + element2.x) / 2}px`;
    number.style.top = `${(element.y + element2.y) / 2}px`;
    treeBlock.appendChild(line);
    treeBlock.appendChild(number);
}

function renderTree(root, container) {
    const queue = [root];
    while (queue.length) {
        const nodes = queue.splice(0, queue.length);
        const level = document.createElement('div');
        level.classList.add('tree__level');
        for (let i = 0; i < nodes.length; i++) {
            if(nodes[i].wasLeaf) {
                const element = document.createElement('div');
                element.innerHTML = nodes[i].nodeName;
                element.setAttribute('id', nodes[i].nodeID);
                element.classList.add('tree__leaf__element');
                level.appendChild(element);
                continue;
            }
            if (nodes[i].branches) {
                const element = document.createElement('div');
                element.innerHTML = nodes[i].nodeName;
                element.setAttribute('id', nodes[i].nodeID);
                element.classList.add('tree__element');
                level.appendChild(element);
                queue.push(...nodes[i].branches);
            }
        }
        container.appendChild(level);
    }

}

function renderLines(root) {
    const queue = [root];
    while (queue.length) {
        const nodes = queue.splice(0, queue.length);
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].branches) {
                queue.push(...nodes[i].branches);
                for (let j = 0; j < nodes[i].branches.length; j++) {
                    const parent = document.getElementById(`${nodes[i].nodeID}`)
                    const child = document.getElementById(`${nodes[i].branches[j].nodeID}`)

                    const element = {
                        x: parent.offsetLeft + parent.offsetWidth / 2,
                        y: parent.offsetTop + parent.offsetHeight / 2
                    };
                    const element2 = {
                        x: child.offsetLeft + child.offsetWidth / 2,
                        y: child.offsetTop + child.offsetHeight / 2
                    }

                    draw(
                        element,
                        element2,
                        nodes[i].parameter[j]
                    );
                }
            }
        }
    }
}

function splitDataSet(array){
    let tempArray = array.map((item) => item.slice());
    let mainArray = [];
    let teachingArray = [];
    teachingArray.push(tempArray[0], tempArray[1]);
    let splitIndex = Math.floor(tempArray.length * SPLIT_COEFICIENT);
    for(let i = 0; i < tempArray.length; i++){
        if(i > splitIndex){
            teachingArray.push(tempArray[i]);
        } else {
            mainArray.push(tempArray[i]);
        }
    }
    return {teachingArray, mainArray};
}
