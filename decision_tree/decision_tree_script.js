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

document.getElementById('pruning').onclick = function ()
{
    treeBlock.innerHTML = "";
    root.pruningTree(root, dataSetTeaching);
    renderTree(root, treeBlock);
    renderLines(root);
}

document.getElementById('clear').onclick = function ()
{
    document.getElementById('decision_table').innerHTML = "";
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
        printTable();
    };
    reader.readAsText(file);
}

function getDistance(x1, x2, y1, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function draw(element, element2, parameter, color) {
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
    if(color !== undefined){
        line.style.color = color;
        number.style.color = color;
    }
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
                    draw(
                        getPositionElement(nodes[i].nodeID),
                        getPositionElement(nodes[i].branches[j].nodeID),
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

function printTable(){
    let table = document.createElement("table");
    let header = document.createElement("thead");
    let body = document.createElement("tbody");
    let footer = document.createElement("tfoot");

    for(let i = 0; i < dataSet.getAttributes().length + 1; i++){
        let th = document.createElement("th");
        if(i === dataSet.getAttributes().length){
            th.innerHTML = "Class";
            header.appendChild(th);
            continue;
        }
        th.innerHTML = dataSet.getAttributes()[i];
        header.appendChild(th);
    }
    table.appendChild(header);

    for(let i = 0; i < ((dataSet.getData().length > 5) ? 5 : dataSet.getData().length); i++){
        let tr = document.createElement("tr");
        for(let j = 0; j < dataSet.getData()[i].length; j++){
            let td = document.createElement("td");
            td.innerHTML = dataSet.getData()[i][j];
            tr.appendChild(td);
        }
        let td = document.createElement("td");
        td.innerHTML = dataSet.getClassData()[i];
        tr.appendChild(td);
        body.appendChild(tr);
    }
    table.appendChild(body);

    let tr = document.createElement("tr");
    for(let i = 0; i < dataSet.getAttributes().length; i++){
        let td = document.createElement("td");
        if(dataSet.getTypeAttributes()[i] === "string"){
            let selector = document.createElement("select");
            for(let j = 0; j < root.getValuesAttribute(dataSet.getData(), i).length; j++){
                let option = document.createElement("option");
                option.innerHTML = root.getValuesAttribute(dataSet.getData(), i)[j];
                selector.appendChild(option);
            }
            td.appendChild(selector);
            tr.appendChild(td);
        }else{
            let input = document.createElement("input");
            input.setAttribute("type", "number");
            td.appendChild(input);
            tr.appendChild(td);
        }
    }

    let td = document.createElement("button");
    td.classList.add("table__button");
    td.setAttribute("id", "predict_button");
    td.innerHTML = "Предсказать";
    tr.appendChild(td);
    footer.appendChild(tr);
    table.appendChild(footer);
    document.getElementById("decision_table").appendChild(table);

    document.getElementById('predict_button').onclick = function ()
    {
        let table = document.getElementById("decision_table");
        let tr = table.getElementsByTagName("tr");
        let td = tr[tr.length - 1].getElementsByTagName("td");
        let values = [];
        for(let i = 0; i < td.length; i++){
            if(dataSet.getTypeAttributes()[i] === "string"){
                let selector = td[i].getElementsByTagName("select");
                values.push(selector[0].value);
            }else{
                let input = td[i].getElementsByTagName("input");
                values.push(parseFloat(input[0].value));
            }
        }
        treeBlock.innerHTML = "";
        renderTree(root, treeBlock);
        renderLines(root);
        let prediction = predict(root, values);
        console.log(prediction);
    }
}

function getPositionElement(elementId){
    const pos = document.getElementById(`${elementId}`);
    return {
        x: pos.offsetLeft + pos.offsetWidth / 2,
        y: pos.offsetTop + pos.offsetHeight / 2
    }
}

function predict(root, values){
    if (root.wasLeaf) {
        markNode(root.nodeID, "green");
        return root.nodeName;
    }
    if (root.data.getTypeAttributes()[root.attributeNumber] === 'string') {
        for (let i = 0; i < root.parameter.length; i++) {
            if (root.parameter[i] === values[root.attributeNumber]) {
                draw(
                    getPositionElement(root.nodeID),
                    getPositionElement(root.branches[i].nodeID),
                    root.parameter[i],
                    "green"
                )
                markNode(root.nodeID, "green");
                return predict(root.branches[i], values);
            }
        }
    }
    else {
        if (values[root.attributeNumber] < parseFloat(root.parameter[0].split(" ")[0])) {
            draw(
                getPositionElement(root.nodeID),
                getPositionElement(root.branches[0].nodeID),
                root.parameter[0],
                "green"
            )
            markNode(root.nodeID, "green");
            return predict(root.branches[0], values);
        }
        else {
            draw(
                getPositionElement(root.nodeID),
                getPositionElement(root.branches[1].nodeID),
                root.parameter[0],
                "green"
            )
            markNode(root.nodeID, "green");
            return predict(root.branches[1], values);
        }
    }
}

function markNode(nodeId, color){
    document.getElementById(nodeId).style.backgroundColor = color;
}
