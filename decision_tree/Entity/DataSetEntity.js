class DataSetEntity {
  constructor(array, classColumNumber, ignoreColum) {
    this.setClassData(array, classColumNumber, ignoreColum);
    this.setAttributes(array, classColumNumber, ignoreColum);
    this.setTypeAttributes(array, classColumNumber, ignoreColum);
    this.setData(array, classColumNumber, ignoreColum);
    this.isValidate = false;
  }
  getAttributes() {
    return this.attributes;
  }
  getTypeAttributes() {
    return this.typeAttributes;
  }
  getData() {
    return this.data;
  }
  getClassData() {
    return this.classData;
  }
  setAttributes(array, classColumNumber, ignoreColum) {
    this.attributes = [];
    for (let i = 0; i < array[0].length; i++) {
      if (i === classColumNumber) {
        continue;
      }
      if (ignoreColum.includes(i)) {
        continue;
      }
      this.attributes.push(array[0][i]);
    }
  }
  setTypeAttributes(array, classColumNumber, ignoreColum) {
    this.typeAttributes = [];
    for (let i = 0; i < array[1].length; i++) {
      if (i === classColumNumber) {
        continue;
      }
      if (ignoreColum.includes(i)) {
        continue;
      }
      this.typeAttributes.push(array[1][i]);
    }
  }
  setData(array, classColumNumber, ignoreColum) {
    this.data = [];
    for (let i = 0; i < array.length; i++) {
      if (i === 0 || i === 1) {
        continue;
      }
      if (ignoreColum.includes(i)) {
        continue;
      }
      let temp = [];
      for (let j = 0; j < array[i].length; j++) {
        if (j === classColumNumber) {
          continue;
        }
        if (ignoreColum.includes(j)) {
          continue;
        }
        temp.push(array[i][j]);
      }
      this.data.push(temp);
    }
  }
  setClassData(array, classColumNumber, ignoreColum) {
    this.classData = [];
    for (let i = 0; i < array.length; i++) {
      if (i === 0 || i === 1) {
        continue;
      }
      if (ignoreColum.includes(i)) {
        continue;
      }
      this.classData.push(array[i][classColumNumber]);
    }
  }

}

module.exports = { DataSetEntity };
