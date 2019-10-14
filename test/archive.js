const COMMON_FILE_PATH = '/Users/imadhushanka/Documents/Build-Tool/common';
const CO_FILE_PATH = '/Users/imadhushanka/Documents/Build-Tool/custom-objects/$object1';
const RESERVED_IDENTIFIERS = ['console','log','return','require','prototype','slice','Facade'];

const esprima = require('esprima');
const fs = require('fs-extra');
const _ = require('lodash');

function getFiles(dir) {

    // get all 'files' in this directory synchronously
    var all = fs.readdirSync(dir);

    // process each checking directories and saving files
    return all.map(file => {

        // is a directory?
        if (fs.statSync(`${dir}/${file}`).isDirectory()) {
            // recursively scan for files
            return getFiles(`${dir}/${file}`);
        }
        return `${dir}/${file}`;  
    });

}

function getFlatArray(filePath){

    var arr = getFiles(filePath);
    //return flat array
    return _.flattenDeep(arr);

}

function isReserved(tokenValue,reservedIdentifiers){  
    //return true if tokenValue equal with reserved identifier array
    return reservedIdentifiers.find(el => el === tokenValue); 
    // return reservedIdentifiers.indexOf(tokenValue) > -1;
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

function getIdentifiers(tokensWithFilePath,reservedIdentifiers){

    var filteredTokens = [];

    filteredTokens = tokensWithFilePath.filter(token => {
        //filter tokens without default identifiers
        return token.type === 'Identifier' && !isReserved(token.value,reservedIdentifiers);
    });
    return filteredTokens;
}

function getUniqueIdentifiers(filteredTokens){

    const identifiers = _.uniqBy(filteredTokens,function(obj){
        return obj.value;
    });

    const uniqueIdentifiers = identifiers.map(element => element.value);
    return uniqueIdentifiers;
}

function traverse(node, func) {
    func(node);//1
    // var depth = 1;
    // console.log(node);
    for (var key in node) { //2
        // console.log(depth);
        // console.log(node[key]);
        if (node.hasOwnProperty(key)) { //3
            var child = node[key];

            if (typeof child === 'object' && child !== null) { //4
                //create a flag or something in the first recursive depth and pass it to the function
                if (Array.isArray(child)) {
                    child.forEach(function(node) { //5
                        traverse(node, func);
                    });
                } else {
                    traverse(child, func); //6
                }
            }
        }
    }
}

function analyseCode(content, file){

    var topLevelDeclaredIdentifiers = [];
    var unDeclaredIdentifiers = [];
    var ast = esprima.parse(content);

    unDeclaredIdentifiers = findUndeclared(ast);
    topLevelDeclaredIdentifiers = findTopLevelDeclared(ast);

    return { filePath: file, topLevelDeclared: topLevelDeclaredIdentifiers, unDeclared: unDeclaredIdentifiers };
}

function findTopLevelDeclared(ast){

    var topLevelDeclaredIdentifiers = [];

    Object.values(ast.body).filter(node => {
   
        if(node.type === 'ClassDeclaration' || node.type === 'FunctionDeclaration'){

            topLevelDeclaredIdentifiers.push(node.id.name);

        }else if(node.type === 'VariableDeclaration' && node.kind === 'const'){

            Object.values(node.declarations).filter(constant => {
                topLevelDeclaredIdentifiers.push(constant.id.name);
            });
        }
    
    });

    return topLevelDeclaredIdentifiers;
}

function findUndeclared(ast){

    var identifiersArray = {};
    var undeclaredArray = [];

    var addStatsEntry = function(identifier){
        if(!identifiersArray[identifier]){
            identifiersArray[identifier] = {calls:0, declarations:false };
        }
    };

    traverse(ast.body, function(node){
        if(node.type === 'ClassDeclaration'){
            addStatsEntry(node.id.name);
            identifiersArray[node.id.name].declarations=true;
        }else if(node.type === 'FunctionDeclaration'){
            addStatsEntry(node.id.name);
            identifiersArray[node.id.name].declarations=true; 
        }else if(node.type === 'VariableDeclaration' && node.kind === 'const'){
            Object.values(node.declarations).filter(constant => {
                addStatsEntry(constant.id.name);
                identifiersArray[constant.id.name].declarations=true;
            });
        }else if(node.type === 'CallExpression' && node.callee.type === 'Identifier'){
            addStatsEntry(node.callee.name);
            identifiersArray[node.callee.name].calls++;
            if(!identifiersArray[node.callee.name].declarations){
                undeclaredArray.push(node.callee.name);
            }
        }
    });

    // console.log(undeclaredArray);
    return undeclaredArray;

}

function findImports(fileVariables){
    fileVariables.forEach(node => {
        fileVariables.forEach(leaf => {
            const insect = _.intersection(node.unDeclared,leaf.topLevelDeclared);
            if(insect.length > 0){
                if (node.imports === undefined) node.imports = [];
                node.imports.push(leaf.filePath);
            }
        });
    });
}

function manageCommonFiles(commonFilePath){

    const flatArray = getFlatArray(commonFilePath);
    var fileVariables = [];

    flatArray.forEach(function(file){
        const content = fs.readFileSync(file,'utf-8');
        // console.log(file);
        fileVariables.push(analyseCode(content,file));
    });

    findImports(fileVariables);

    return fileVariables;
}


const commonFileVariables = manageCommonFiles(COMMON_FILE_PATH);

const customObjectArray = getFlatArray(CO_FILE_PATH);
const coTokens = getTokens(customObjectArray);
const coIdentifiers = getIdentifiers(coTokens,RESERVED_IDENTIFIERS);
const coUniqueIdentifiers = getUniqueIdentifiers(coIdentifiers);

// console.log("COMMON FILE VARIABLES",commonFileVariables);
// console.log("CUSTOM OBJECTS VARIABLES",coUniqueIdentifiers);

var copyArray = [];

commonFileVariables.forEach(node => {

    const insect = _.intersection(node.topLevelDeclared,coUniqueIdentifiers);
    if(insect.length > 0){
        if(!node.imports){
            copyArray.push(node.filePath);
        }else{
            copyArray.push(node.filePath,node.imports);
        }
        
    }

});


console.log(copyArray);