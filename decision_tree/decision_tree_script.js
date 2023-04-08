import { validateDataSet } from "./validate.js";
import { parseCSV } from "./parseCSV.js";
import { DataSetEntity } from './Entity/DataSetEntity.js';
import { Node } from './DecisionTree.js';

let dataSetTeaching;
let dataSet;
let root;
const splitCoff = 0.8;
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

    line.style.left = `${element.x}px`;
    line.style.top = `${element.y}px`;
    line.style.width = `${length}px`;
    line.classList.add("line");
    number.classList.add("number");
    number.innerHTML = index;
    document.body.appendChild(line);
    document.body.appendChild(number);
}

const treeBlock = document.querySelector('.tree');

function renderTree(root, container) {
    const queue = [root];
    while (queue.length) {
        const nodes = queue.splice(0, queue.length);
        const level = document.createElement('div');
        level.classList.add('tree__level');
        for (let i = 0; i < nodes.length; i++) {
            if(nodes[i].branches === undefined) {
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
                    draw(
                        document.getElementById(nodes[i].nodeID).getBoundingClientRect(),
                        document.getElementById(nodes[i].branches[j].nodeID).getBoundingClientRect(),
                        nodes[i].parameter[j]
                    );
                }
            }
        }
    }
}

document.getElementById('build-tree').onclick = function ()
{
    root.buildTree(root);
    console.log(root);
    renderTree(root, treeBlock);
    debugger;
    renderLines(root);
}

document.getElementById('predict').onclick = function ()
{
    debugger;
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
        let split = splitDataSet(parsed);
        console.log(split);
        dataSet = new DataSetEntity(split.mainArray, parsed[0].length - 1, []);
        dataSetTeaching = new DataSetEntity(split.teachingArray, parsed[0].length - 1, []);
        let errors = validateDataSet(dataSet);
        if (errors.length !== 0) {
            console.log("DataSet - ERROR");
            return;
        } else {
            console.log("DataSet - OK");
        }
        root = new Node("root",null, dataSet, null, -1, null, -1);
        console.log(dataSet);
        console.log(dataSetTeaching);
    };
    reader.readAsText(file);
}

function splitDataSet(array){
    let tempArray = array.map((item) => item.slice());
    let mainArray = [];
    let teachingArray = [];
    teachingArray.push(tempArray[0], tempArray[1]);
    let splitIndex = Math.floor(tempArray.length * splitCoff);
    for(let i = 0; i < tempArray.length; i++){
        if(i > splitIndex){
            teachingArray.push(tempArray[i]);
        } else {
            mainArray.push(tempArray[i]);
        }
    }
    return {teachingArray, mainArray};
}
