COMMON_FILE_PATH = '/Users/imadhushanka/Documents/Build-Tool/common';
CO_FILE_PATH = '/Users/imadhushanka/Documents/Build-Tool/custom-objects';

const esprima = require('esprima');
const fs = require('fs');
const _ = require('lodash');
const HashMap = require('hashmap');

const commonArray = getFlatArray(COMMON_FILE_PATH);
const commonTokens = getTokens(commonArray);
const commonIdentifiers = getIdentifiers(commonTokens);
const commonUniqueIdentifiers = getUniqueIdentifiers(commonIdentifiers);

const customObjectArray = getFlatArray(CO_FILE_PATH);
const coTokens = getTokens(customObjectArray);
const coIdentifiers = getIdentifiers(coTokens);
const coUniqueIdentifiers = getUniqueIdentifiers(coIdentifiers);

const intersectionArray = getIntersection(commonUniqueIdentifiers,coUniqueIdentifiers);

// console.log("Common Unique Identifiers",commonUniqueIdentifiers);
// console.log("CO Unique Identifiers",coUniqueIdentifiers);

console.log(intersectionArray);



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
        tokens.push(esprima.tokenize(content));

    });

    return _.flattenDeep(tokens);//return flat array with tokens
}

function getIdentifiers(tokens){

    var filteredTokens = [];

    filteredTokens = tokens.filter(token => {
        return token.type === 'Identifier' && !isReserved(token.value);
    });
    return filteredTokens;
}

function getUniqueIdentifiers(filteredTokens){

    const uniqueIdentifiers = _.uniqBy(filteredTokens,function(obj){
        return obj.value;
    });
    return uniqueIdentifiers;
}

function getIntersection(arr1, arr2){

    var intersectionArray = [];
    intersectionArray = _.intersectionBy(arr1,arr2,'value');
    return intersectionArray;
}

function getHashMap(uniqueIdentifiers){

    const hashmap = new HashMap();
    uniqueIdentifiers.forEach(token => {
        hashmap.set(token.value,file);
    });
    return hashmap;
}

function isReserved(tokenValue){
    //Implement array and find or implement filter
    if(tokenValue == 'console'){
        return true;
    }
}


// const intersection_arr = _.intersectionBy(common_unique_filtered_tokens,co_unique_filtered_tokens,'value');

// console.log("Intersection Array",intersection_arr);



//use intersection by in lodash to get the intersection between two object arrays
