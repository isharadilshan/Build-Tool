const COMMON_FILE_PATH = '/Users/imadhushanka/Documents/Build-Tool/common';
const CO_FILE_PATH = '/Users/imadhushanka/Documents/Build-Tool/custom-objects';
const RESERVED_IDENTIFIERS = ['console','log','return','require','prototype','slice','Facade'];

const esprima = require('esprima');
const fs = require('fs');
const _ = require('lodash');
// const HashMap = require('hashmap');

const commonArray = getFlatArray(COMMON_FILE_PATH);
const commonTokens = getTokensWithFilePath(commonArray);
const commonIdentifiers = getIdentifiers(commonTokens);
const commonUniqueIdentifiers = getUniqueIdentifiers(commonIdentifiers);
const map = getMap(commonUniqueIdentifiers);
// console.log(hashmap);

const customObjectArray = getFlatArray(CO_FILE_PATH);
const coTokens = getTokens(customObjectArray);
const coIdentifiers = getIdentifiers(coTokens);
const coUniqueIdentifiers = getUniqueIdentifiers(coIdentifiers);

const intersectionArray = getIntersection(commonUniqueIdentifiers,coUniqueIdentifiers);

// console.log("Common Unique Identifiers",commonUniqueIdentifiers);
// console.log("CO Unique Identifiers",coUniqueIdentifiers);

console.log("Intersection Array",intersectionArray);



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
    return _.flattenDeep(tokens);//return flat array with tokens
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
    return tokensWithFilePath;//return tokens array with their corresponding file path
}

function getIdentifiers(tokensWithFilePath){

    var filteredTokens = [];

    filteredTokens = tokensWithFilePath.filter(token => {
        return token.type === 'Identifier' && !isReserved(token.value,RESERVED_IDENTIFIERS);//filter tokens without default identifiers
    });
    return filteredTokens;
}

function getUniqueIdentifiers(filteredTokens){

    const uniqueIdentifiers = _.uniqBy(filteredTokens,function(obj){
        return obj.value;
    });
    return uniqueIdentifiers;//return unique identifiers
}

function getIntersection(arr1, arr2){

    var intersectionArray = [];
    intersectionArray = _.intersectionBy(arr1,arr2,'value');//get the intersection only by considering the value
    return intersectionArray;
}

// function getHashMap(uniqueIdentifiers){

//     const hashmap = new HashMap();
//     uniqueIdentifiers.forEach(token => {
//         hashmap.set(token.value,token.filepath);
//     });
//     return hashmap;
// }

function getMap(uniqueIdentifiers){

    const map = new Map();
    uniqueIdentifiers.forEach(token => {
        map.set(token.value,token.filepath);
    });
    return map;
}

function isReserved(tokenValue,reservedIdentifiers){  
    return reservedIdentifiers.find(el => el === tokenValue);//return true 
    // return reservedIdentifiers.indexOf(tokenValue) > -1;
}

function getFilePaths(map,intersecArray){
    // intersecArray.forEach(obj => {
    //     if(map.get(obj.))
    // })
}

const hmap = new Map();



// const intersection_arr = _.intersectionBy(common_unique_filtered_tokens,co_unique_filtered_tokens,'value');

// console.log("Intersection Array",intersection_arr);



//use intersection by in lodash to get the intersection between two object arrays
