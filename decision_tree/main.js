const { parseCSV } = require('./parseCSV.js');
const { DataSetEntity } = require('./Entity/DataSetEntity.js');
const { validateDataSet } = require('./validate.js');
const { getTestDataSet } = require('./TestData/testDataSet.js');
const { Node } = require('./DecisionTree.js');
function main() {
  /*let text = "a,b,c";
  let parsed = parseCSV(text);*/
  //прочитать файл из CSVTestData/breastCancer.csv
  let dataSet = new DataSetEntity(getTestDataSet(1), 4, []);
  let errors = validateDataSet(dataSet);
  if (errors.length !== 0) {
    console.log("DataSet - ERROR");
    return;
  } else {
    console.log("DataSet - OK");
  }
  let root = new Node("root",null, dataSet, null, -1, null, -1);
  root.buildTree(root);
  root.printTree(root);

}


main();

/*
buildTree(node) {
    if (node.data.length === 0) {
      return;
    }
    if(node.depth > MAX_DEPTH) {
      return;
    }
    if (node.depth === 0) {
      this.attributeNumber = this.getBestAttribute(node.data);
    }
    let attribute = this.attributeNumber;
    let attributeValues = this.getValues(node.data.getData(), attribute);
    this.parameter = attributeValues;
    this.gain = this.getGain(node.data.getData(), attribute);
    for (let i = 0; i < attributeValues.length; i++) {
      let branch = new Node(
        attributeValues[i],
        attribute,
        this.getSubData(node.data.getAttributes(), node.data.getTypeAttributes(), attribute, attributeValues[i]),
        node,
        node.depth,
        node.parameter,
        node.gain
      );
      node.branches.push(branch);
      if (branch.data.getData().length === 0) {
        continue;
      }
      if (this.isLeaf(branch)) {
        continue;
      }
      this.buildTree(branch);
    }
  }
  getSubData(nameAttribute, typeAttribute, attributeNumber, value) {
    let data = []
    data.push(nameAttribute);
    data.push(typeAttribute);
    for (let i = 0; i < this.data.getData().length; i++) {
      if (this.data.getData()[i][attributeNumber] === value) {
        data.push(this.data.getData()[i]);
      }
    }
    return new DataSetEntity(data);
  }
  getBestAttribute(data) {
    let bestAttribute = 0;
    let bestGain = 0;
    for (let i = 0; i < data.getAttributes().length - 1; i++) {
      let gain = this.getGain(data.getData(), i);
      if (gain > bestGain) {
        bestGain = gain;
        bestAttribute = i;
      }
    }
    return bestAttribute;
  }
  getGain(data, attributeNumber) {
    let countExamplesMinusUndefined = data.length - this.getUndefined(data, attributeNumber);
    let info = this.getInfo(data, countExamplesMinusUndefined);
    let infoX = this.getInfoX(data, attributeNumber, countExamplesMinusUndefined);
    //Gain(X) = (N(S)-U)/N(S)*(Info(S) - InfoX(S))
    return (countExamplesMinusUndefined) / data.length * (info - infoX);
  }
  getInfo(data, countExamplesMinusUndefined) {
    let info = 0;
    let classes = this.getClasses(data);
    //Info(S) = -sum(k, j=1) (N(Cj,S)/(N(S)-U)*log(N(Cj,S)/(N(S)-U),2)
    for (let i = 0; i < classes.length; i++) {
      let classCount = this.getClassCount(data, classes[i]);
      info -= classCount / countExamplesMinusUndefined * Math.log2(classCount / countExamplesMinusUndefined);
    }
    return info;
  }
  getInfoX(data, attributeNumber, countExamplesMinusUndefined) {
    let infoX = 0;
    let attributeValues = this.getValues(data, attributeNumber);
    //InfoX(S) = sum(k, j=1) (N(Sj)/(N(S)-U)*Info(Sj))
    for (let i = 0; i < attributeValues.length; i++) {
      let branch = this.getBranch(data, attributeNumber, attributeValues[i]);
      let countBranchExamplesMinusUndefined = branch.length - this.getUndefined(branch, attributeNumber);
      let info = this.getInfo(branch, countBranchExamplesMinusUndefined);
      infoX += countBranchExamplesMinusUndefined / countExamplesMinusUndefined * info;
    }
    return infoX;
  }

  splitInfo(data, attributeNumber) {
    let splitInfo = 0;
    let attributeValues = this.getValues(data, attributeNumber);
    //Split-info(S)  = sum(p,i=1)(N(Si)/N(S)*log(N(Si)/N(S))
    for (let i = 0; i < attributeValues.length; i++) {
      let branch = this.getBranch(data, attributeNumber, attributeValues[i]);
      let countBranchExamplesMinusUndefined = branch.length - this.getUndefined(branch, attributeNumber);
      splitInfo -= countBranchExamplesMinusUndefined / data.length * Math.log2(countBranchExamplesMinusUndefined / data.length);
    }
    return splitInfo;
  }

  gainRatio(data, attributeNumber) {
    //Gain-Ratio(S) = Gain(S)/Split-Info(S)
    return this.getGain(data, attributeNumber) / this.splitInfo(data, attributeNumber);
  }

  getClasses(data) {
    let classes = [];
    for (let i = 0; i < data.length; i++) {
      if (!classes.includes(data[i][data[i].length - 1])) {
        classes.push(data[i][data[i].length - 1]);
      }
    }
    return classes;
  }
  getClassCount(data, className) {
    let count = 0;
    for (let i = 0; i < data.length; i++) {
      if (data[i][data[i].length - 1] === className) {
        count++;
      }
    }
    return count;
  }
  getValues(data, attribute) {
    let values = [];
    for (let i = 0; i < data.length; i++) {
      if (!values.includes(data[i][attribute])) {
        values.push(data[i][attribute]);
      }
    }
    return values;
  }
  getBranch(data, attribute, value) {
    let branch = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i][attribute] === value) {
        branch.push(data[i]);
      }
    }
    return branch;
  }
  getUndefined(data, attribute) {
    let count = 0;
    for (let i = 0; i < data.length; i++) {
      if (data[i][attribute] === undefined) {
        count++;
      }
    }
    return count;
  }
  isLeaf(node) {
    let classes = this.getClasses(node.data.getData());
    return classes.length === 1;
  }
  pruneTree(node) {
    if (node.branches.length === 0) {
      return;
    }
    for (let i = 0; i < node.branches.length; i++) {
      this.pruneTree(node.branches[i]);
    }
    if (node.branches.length === 0) {
      return;
    }
    let classes = this.getClasses(node.data);
    let classCount = this.getClassCount(node.data, classes[0]);
    let classCount2 = this.getClassCount(node.data, classes[1]);
    let leaf = new Node(
      classCount > classCount2 ? classes[0] : classes[1],
      node.attributeNumber,
      node.data,
      node.parent,
      node.depth,
      node.parameter,
      node.gain
    );
    leaf.wasLeaf = true;
    if (node.parent) {
      for (let i = 0; i < node.parent.branches.length; i++) {
        if (node.parent.branches[i].nodeName === node.nodeName) {
          node.parent.branches[i] = leaf;
        }
      }
    }
    let accuracy = this.getAccuracy(node);
    let accuracy2 = this.getAccuracy(leaf);
    if (accuracy2 > accuracy) {
      node = leaf;
    }
  }
  getAccuracy(node) {
    let count = 0;
    for (let i = 0; i < node.data.length; i++) {
      if (node.data[i][node.data[i].length - 1] === node.nodeName) {
        count++;
      }
    }
    return count / node.data.length;
  }
*/
