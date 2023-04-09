import { DataSetEntity } from './Entity/DataSetEntity.js';
function validateDataSet(dataSet){
  let attributes = dataSet.getAttributes();
  let typeAttributes = dataSet.getTypeAttributes();
  let data = dataSet.getData();
  let errors = [];

  if(typeof attributes === "undefined"){
    errors.push("attributes is undefined");
    return errors;
  }

  if(typeof typeAttributes === "undefined"){
    errors.push("typeAttributes is undefined");
    return errors;
  }

  if(typeof data === "undefined"){
    errors.push("data is undefined");
    return errors;
  }

  if(attributes.length !== typeAttributes.length){
    errors.push("attributes.length != typeAttributes.length");
    return errors;
  }

  for(let i = 0; i < data.length; i++){
    if(data[i].length !== attributes.length){
      errors.push("data[i].length != attributes.length");
    }
  }

  if(errors.length !== 0){
    return errors;
  }

  for(let i = 0; i < typeAttributes.length; i++){
    if(typeAttributes[i] === "int"){
      for (let j = 0; j < data.length; j++) {
        if(!Number.isInteger(parseInt(data[j][i]))){
          errors.push("Element is not int. It is " + data[j][i] + ". String number is " + (j + 1) + " Attribute number is " + (i + 1));
        }
      }
    }

    else if(typeAttributes[i] === "float"){
      for (let j = 0; j < data.length; j++) {
        if(!Number.isInteger(parseInt(data[j][i]))){
          errors.push("Element is not float. It is " + data[j][i] + ". String number is " + (j + 1) + " Attribute number is " + (i + 1));
        }
      }
    }

    else if(typeAttributes[i] === "string"){
      for (let j = 0; j < data.length; j++) {
        if(Number.isInteger(parseInt(data[j][i]))){
          errors.push("Element is not string. It is " + data[j][i] + ". String number is " + (j + 1) + " Attribute number is " + (i + 1));
        }
      }
    }else{
      errors.push("typeAttributes is not int, float or string. It is " + typeAttributes[i] + ". Attribute number is " + (i + 1));
    }
  }
  if(errors.length === 0){
    dataSet.isValidate = true;
    convertDataSet(dataSet);
  }
  return errors;
}

function validateObject(object, typeAttributes){
  let errors = [];
  if(typeof object === "undefined"){
    errors.push("object is undefined");
    return errors;
  }
  if(object.length !== typeAttributes.length){
    errors.push("object.length != typeAttributes.length");
    return errors;
  }
  for(let i = 0; i < typeAttributes.length; i++){
    if(typeAttributes[i] === "int"){
      if(!Number.isInteger(parseInt(object[i]))){
        errors.push("Element is not int. It is " + object[i] + ". Attribute number is " + (i + 1));
      }
    }
    else if(typeAttributes[i] === "float"){
      if(!Number.isInteger(parseFloat(object[i]))){
        errors.push("Element is not float. It is " + object[i] + ". Attribute number is " + (i + 1));
      }
    }
    else if(typeAttributes[i] === "string"){
      if(Number.isInteger(parseInt(object[i])) ||
         Number.isInteger(parseFloat(object[i]))){
        errors.push("Element is not string. It is " + object[i] + ". Attribute number is " + (i + 1));
      }
    }
  }
  if(errors.length === 0){
    convertObject(object, typeAttributes);
  }
  return errors;
}

function convertDataSet(dataSet){
  let typeAttributes = dataSet.getTypeAttributes();
  let data = dataSet.getData();
  for(let i = 0; i < data.length; i++){
    for(let j = 0; j < data[i].length; j++){
      if(typeAttributes[j] === "int"){
        data[i][j] = parseInt(data[i][j]);
      }
      else if(typeAttributes[j] === "float"){
        data[i][j] = parseFloat(data[i][j]);
      }
    }
  }
}

function convertObject(object, typeAttributes){
  for(let i = 0; i < object.length; i++){
    if(typeAttributes[i] === "int"){
      object[i] = parseInt(object[i]);
    }
    else if(typeAttributes[i] === "float"){
      object[i] = parseFloat(object[i]);
    }
  }
}

export { validateDataSet, validateObject };
