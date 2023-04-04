const { parseCSV } = require('./parseCSV.js');
const { DataSetEntity } = require('./Entity/DataSetEntity.js');
const { validateDataSet } = require('./validate.js');
const { getTestDataSet } = require('./TestData/testDataSet.js');
const { Node } = require('./DecisionTree.js');
function main() {
  /*let text = "a,b,c";
  let parsed = parseCSV(text);*/
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

//ky

main();
