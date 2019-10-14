const COMMON_FILE_PATH = '/Users/imadhushanka/Documents/Build-Tool/common';
const CO_FILE_PATH = '/Users/imadhushanka/Documents/Build-Tool/custom-objects';
const RESERVED_IDENTIFIERS = ['console','log','return','require','prototype','slice','Facade'];
const DESTINATION = '/Users/imadhushanka/Documents/Build-Tool/custom-objects/$object1/includes/';

const esprima = require('esprima');
const fs = require('fs-extra');
const _ = require('lodash');

const commonArray = getFlatArray(COMMON_FILE_PATH);
const commonTokens = getTokensWithFilePath(commonArray);
const commonIdentifiers = getIdentifiers(commonTokens);
// console.log(commonIdentifiers);
const commonUniqueIdentifiers = getUniqueIdentifiers(commonIdentifiers);

const customObjectArray = getFlatArray(CO_FILE_PATH);
const coTokens = getTokens(customObjectArray);
const coIdentifiers = getIdentifiers(coTokens);
const coUniqueIdentifiers = getUniqueIdentifiers(coIdentifiers);

const intersectionArray = getIntersection(commonUniqueIdentifiers,coUniqueIdentifiers);

console.log(intersectionArray);

// console.log("Common Unique Identifiers",commonUniqueIdentifiers);
// console.log("CO Unique Identifiers",coUniqueIdentifiers);
// console.log("Intersection Array",intersectionArray);

const filePaths = getFilePaths(intersectionArray);
// console.log(filePaths);
copyFiles(filePaths,DESTINATION);



function getFiles(dir) {

    // get all 'files' in this directory synchronously
    var all = fs.readdirSync(dir);

    // process each checking directories and saving files
    return all.map(file => {
        // console.log(file);
        // am I a directory?
        if (fs.statSync(`${dir}/${file}`).isDirectory()) {
            // recursively scan me for my files
            return getFiles(`${dir}/${file}`);
        }
        // could be something else here!!!
        return `${dir}/${file}`;  
    });

}

function getFlatArray(filePath){

    var arr = getFiles(filePath);
    //return flat array
    return _.flattenDeep(arr);

}

function getTokens(flatArray){

    var tokens = [];

    flatArray.forEach(function(file){
    
        const content = fs.readFileSync(file,'utf-8');
        tokens.push(file,esprima.tokenize(content));

    });
    //return flat array with tokens
    return _.flattenDeep(tokens);
}

function getTokensWithFilePath(flatArray){

    var tokens = [];

    flatArray.forEach(function(file){
    
        const content = fs.readFileSync(file,'utf-8');
        tokens.push(file,esprima.tokenize(content));

    });
    const flatTokenArray = _.flattenDeep(tokens);

    let filepath = undefined;
    const tokensWithFilePath = flatTokenArray.map(el => {
        if (typeof el === 'string') {
          filepath = el;
          return null;
        }
        return { ...el, filepath };
      }).filter(el => el != null);
    //return tokens array with their corresponding file path
    return tokensWithFilePath;
}

function getIdentifiers(tokensWithFilePath){

    var filteredTokens = [];

    filteredTokens = tokensWithFilePath.filter(token => {
        //filter tokens without default identifiers
        return token.type === 'Identifier' && !isReserved(token.value,RESERVED_IDENTIFIERS);
    });
    return filteredTokens;
}

function getUniqueIdentifiers(filteredTokens){

    const uniqueIdentifiers = _.uniqBy(filteredTokens,function(obj){
        return obj.value;
    });
    //return unique identifiers
    return uniqueIdentifiers;
}

function getIntersection(arr1, arr2){

    var intersectionArray = [];
    //get the intersection only by considering the value
    intersectionArray = _.intersectionBy(arr1,arr2,'value');
    return intersectionArray;
}

function isReserved(tokenValue,reservedIdentifiers){  
    //return true if tokenValue equal with reserved identifier array
    return reservedIdentifiers.find(el => el === tokenValue); 
    // return reservedIdentifiers.indexOf(tokenValue) > -1;
}

function getFilePaths(intersecArray){
    //extract unique file paths from intersection array
    const filepathArray = _.uniqBy(intersecArray,function(obj){
        return obj.filepath;
    });

    var filepaths =[];
    filepathArray.forEach(obj => {
        filepaths.push(obj.filepath);
    });
    return filepaths;
}

function copyFiles(filepaths,destination){

    filepaths.forEach(file => {
        fs.copy(file, destination+file.substring(file.indexOf('/common/')+8));//,file.lastIndexOf('/')
    })
}



