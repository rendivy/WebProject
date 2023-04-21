import {DataSetEntity} from "./Entity/DataSetEntity.js";

const MAX_DEPTH = 5;
const MIN_COUNT_EXAMPLES_IN_NODE = 1;
let id = 0;
class Node{

  constructor(nodeName, attributeNumber, data, parent, depth, parameter, gain) {
    //имя аттрибута по коротому произошло разбиение
    this.nodeName = nodeName;
    //параметр отвечает за то, по какой метрики произошло разбиение
    this.parameter = parameter;
    //DataSetEntity
    this.data = data;
    //номер атрибута по которому произошло разбиение
    this.attributeNumber = attributeNumber;
    //массив потомков
    this.branches = [];
    //родитель
    this.parent = parent;
    //глубина
    this.depth = depth + 1;
    //прирост информации, необходим для разбиения и для обрезки
    this.gain = gain;
    this.nodeID = id++;
    this.wasLeaf = false;
    this.wasPainted = false;
  }

  buildTree(node) {
    const classes = this.getClasses(node.data);

    if(classes.length === 0){
        node.wasLeaf = true;
        node.parameter = undefined;
        node.gain = undefined;
        node.branches = undefined;
        node.attributeNumber = undefined;
        node.nodeName = this.getMostCommonClass(node.parent.data);
        return;
    }

    if (classes.length === 1) {
      node.wasLeaf = true;
      node.parameter = undefined;
      node.gain = undefined;
      node.branches = undefined;
      node.attributeNumber = undefined;
      node.nodeName = classes[0];
      return;
    }

    if (node.depth >= MAX_DEPTH || node.data.getData().length <= MIN_COUNT_EXAMPLES_IN_NODE) {
      node.wasLeaf = true;
      node.parameter = undefined;
      node.gain = undefined;
      node.branches = undefined;
      node.attributeNumber = undefined;
      node.nodeName = this.getMostCommonClass(node.data);
      return;
    }

    let bestAttribute = this.getBestAttribute(node.data);

    node.attributeNumber = bestAttribute.bestAttributeNumber;
    node.gain = bestAttribute.bestGain;
    node.nodeName = node.data.getAttributes()[bestAttribute.bestAttributeNumber];

    let split;
    let name = [];
    if(node.data.getTypeAttributes()[bestAttribute.bestAttributeNumber] === 'int'
      || node.data.getTypeAttributes()[bestAttribute.bestAttributeNumber] === 'float') {
      let parameter = this.getThreshold(this.getValuesAttribute(node.data.getData(), bestAttribute.bestAttributeNumber));
        node.parameter = [parameter.toFixed(2) + " <", parameter.toFixed(2) + " >="];
      split = this.splitNumeric(node.data, bestAttribute.bestAttributeNumber);
        name.push(parameter + " <", parameter + " >=");
    }else{
      node.parameter = this.getValuesAttribute(node.data.getData(), bestAttribute.bestAttributeNumber);
      split = this.splitCategorical(node.data, bestAttribute.bestAttributeNumber);
      for(let i = 0; i < split.length; i++){
        name.push(split[i][0][bestAttribute.bestAttributeNumber]);
      }
    }

  for (let i = 0; i < split.length; i++) {
      let branch = new Node(
        name[i],
        bestAttribute.bestAttributeNumber,
        this.createDataSetEntity(split[i], node.data.getAttributes(), node.data.getTypeAttributes()),
        node,
        node.depth,
        node.parameter,
        node.gain
      );
      node.branches.push(branch);
      this.buildTree(branch);
    }

  }

  predict(root, line){
    if(root.wasLeaf){
      return root.nodeName;
    }
    if(root.data.getTypeAttributes()[root.attributeNumber] === 'string'){
        for(let i = 0; i < root.parameter.length; i++){
            if(root.parameter[i] === line[root.attributeNumber]){
                return this.predict(root.branches[i], line);
            }
        }
    }else{
        if(line[root.attributeNumber] < parseFloat(root.parameter[0].split(" ")[0])){
            return this.predict(root.branches[0], line);
        }else{
            return this.predict(root.branches[1], line);
        }
    }
  }

  pruningTree(node, dataSetTeaching) {
      if (node.wasLeaf) {
          return;
      }
      if(node.depth === 0){
          for(let i = 0; i < node.branches.length; i++){
              this.pruningTree(node.branches[i], dataSetTeaching);
          }
          return;
      }
      let averageNodeError = this.getAverageNodeError(node);
      for (let i = 0; i < node.branches.length; i++) {
          this.pruningTree(node.branches[i], dataSetTeaching);
      }
      let nodeError = this.getNodeError(node, dataSetTeaching);
      let nodeErrorSwap = this.getNodeErrorSwap(node, dataSetTeaching);
      if (nodeErrorSwap < nodeError) {
          this.nodeSwap(node, new Node(this.getMostCommonClass(node.data), undefined, undefined, node.parent, node.depth, undefined, undefined));
      }
      if (nodeErrorSwap < averageNodeError) {
          this.nodeSwap(node, new Node(this.getMostCommonClass(node.data), undefined, undefined, node.parent, node.depth, undefined, undefined));
      }
  }

  getAverageNodeError(node) {
      let error = 0;
      for (let i = 0; i < node.data.getData().length; i++) {
          if (this.predict(node.parent, node.data.getData()[i]) !== node.data.getClassData()[i]) {
              error++;
          }
      }
      return error / node.data.getData().length;
  }

  nodeSwap(node, newNode) {
      if (node.parent === undefined) {
          return;
      }
      let index = node.parent.branches.indexOf(node);
      node.parent.branches[index] = newNode;
      newNode.parent = node.parent;
      newNode.wasLeaf = true;
  }

  getNodeErrorSwap(node, dataSetTeaching) {
      let error = 0;
      for (let i = 0; i < dataSetTeaching.getData().length; i++) {
          if (this.predict(node, dataSetTeaching.getData()[i]) !== dataSetTeaching.getClassData()[i]) {
              error++;
          }
      }
      return error / dataSetTeaching.getData().length;
  }

  getNodeError(node, dataSetTeaching) {
      let error = 0;
      for (let i = 0; i < dataSetTeaching.getData().length; i++) {
          if (this.predict(node.parent, dataSetTeaching.getData()[i]) !== dataSetTeaching.getClassData()[i]) {
              error++;
          }
      }
      return error / dataSetTeaching.getData().length;
  }

  splitNumeric(data, attributeNumber) {
    let attributeValues = this.getValuesAttribute(data.getData(), attributeNumber);
    let threshold = this.getThreshold(attributeValues);
    let left = [];
    let right = [];
    for (let i = 0; i < attributeValues.length; i++) {
      if (attributeValues[i] < threshold) {
        left.push([data.getData()[i], data.getClassData()[i]]);
      } else {
        right.push([data.getData()[i], data.getClassData()[i]]);
      }
    }
    return [left, right];
  }

  splitCategorical(data, attributeNumber) {
    let attributeValues = this.getValuesAttribute(data.getData(), attributeNumber);
    let branches = [];
    for (let i = 0; i < attributeValues.length; i++) {
      let branch = [];
      for (let j = 0; j < data.getData().length; j++) {
        if (data.getData()[j][attributeNumber] === attributeValues[i]) {
          branch.push([data.getData()[j], data.getClassData()[j]]);
        }
      }
      branches.push(branch);
    }
    if(branches.length === 1)
      return [branches[0]];
    return branches;
  }

  getBestAttribute(data) {
    let bestAttributeNumber = 0;
    let bestGain = 0;
    for (let i = 0; i < data.getAttributes().length; i++) {
      if (data.getTypeAttributes()[i] === 'int' || data.getTypeAttributes()[i] === 'float') {
        let gain = this.getGainNumeric(data, i);
        if (gain > bestGain) {
          bestGain = gain;
          bestAttributeNumber = i;
        }
      } else {
        let gain = this.getGainCategorical(data, i);
        if (gain > bestGain) {
          bestGain = gain;
          bestAttributeNumber = i;
        }
      }
    }
    return {bestAttributeNumber, bestGain};
  }

  getGainCategorical(data, attributeNumber) {
    let gain = this.getEntropy(data);
    let attributeValues = this.getValuesAttribute(data.getData(), attributeNumber);
    for (let i = 0; i < attributeValues.length; i++) {
      let subData = data.getData().filter(
        item =>
          item[attributeNumber] === attributeValues[i]).map(
            item => [item[attributeNumber], data.getClassData()[data.getData().indexOf(item)]]
      );
      gain -= (subData.length / data.getData().length) * this.getEntropyByColum(subData);
    }
    return gain;
  }

  getGainNumeric(data, attributeNumber) {
    let gain = this.getEntropy(data);
    let attributeValues = this.getValuesAttribute(data.getData(), attributeNumber);
    let threshold = this.getThreshold(attributeValues);
    let leftData = data.getData().filter(
      item => item[attributeNumber] <= threshold).map(
        item => [item[attributeNumber], data.getClassData()[data.getData().indexOf(item)]]
    );
    let rightData = data.getData().filter(
      item => item[attributeNumber] > threshold).map(
        item => [item[attributeNumber], data.getClassData()[data.getData().indexOf(item)]]
    );
    gain -= (leftData.length / data.getData().length) * this.getEntropyByColum(leftData);
    gain -= (rightData.length / data.getData().length) * this.getEntropyByColum(rightData);
    return gain;
  }

  getEntropy(data) {
    let entropy = 0;
    let classes = this.getClasses(data);
    classes.forEach((item) => {
      let p = this.getClassCount(data, item) / data.getClassData().length;
      entropy -= p * Math.log2(p + 0.00000001);
    });
    return entropy;
  }

  getEntropyByColum(data){
    let entropy = 0;
    let  classes = [];
    data.forEach((item) => { if (!classes.includes(item[1])) classes.push(item[1]); });
    classes.forEach((item) => {
      let p = data.filter((item2) => item2[1] === item).length / data.length;
      entropy -= p * Math.log2(p + 0.00000001);
    });
    return entropy;
  }

  getThreshold(attributeValues) {
    let threshold = 0;
    for (let i = 0; i < attributeValues.length - 1; i++) {
      threshold += (attributeValues[i] + attributeValues[i + 1]) / 2;
    }
    return threshold / attributeValues.length;
  }

  getValuesAttribute(data, attributeNumber) {
    let values = [];
    data.forEach((item) => { if (!values.includes(item[attributeNumber])) values.push(item[attributeNumber]); });
    return values;
  }

  getClasses(data) {
    let classes = [];
    data.getClassData().forEach((item) => { if (!classes.includes(item)) classes.push(item); });
    return classes;
  }

  getMostCommonClass(data) {
    let classes = this.getClasses(data);
    let classCount = [];
    let max = 0;
    let maxIndex = 0;
    classes.forEach((item) => {
      classCount.push(this.getClassCount(data, item));
      if (classCount[classCount.length - 1] > max) {
        max = classCount[classCount.length - 1];
        maxIndex = classCount.length - 1;
      }
    });
    return classes[maxIndex];
  }

  getClassCount(data, className) {
    let count = 0;
    data.getClassData().forEach((item) => { if (item === className) count++; });
    return count;
  }

  createDataSetEntity(data, attributes, typeAttributes){
    let array =  [];
    let tempData = data.map((item) => [item[0].slice(), item[1]]);
    let atr = attributes.slice();
    let typeAtr = typeAttributes.slice();
    array.push(atr);
    array.push(typeAtr);
    array[0].push('class');
    array[1].push('type');
    for (let i = 0; i < tempData.length; i++) {
      array.push(tempData[i][0]);
      array[i + 2].push(tempData[i][1]);
    }
    return new DataSetEntity(array, atr.length - 1, []);
  }
}

export {Node};
