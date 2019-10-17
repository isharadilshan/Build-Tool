const COMMON_FILE_PATH = '/Users/imadhushanka/Documents/Build-Tool/common';
const CO_FILE_PATH = '/Users/imadhushanka/Documents/Build-Tool/custom-objects';
const RESERVED_IDENTIFIERS = ['console','log','return','require','prototype','slice','Facade'];

const esprima = require('esprima');
const fs = require('fs-extra');
const _ = require('lodash');

function getFiles(dir) {

    // get all 'files' in this directory synchronously
    var all = fs.readdirSync(dir);

    // process each checking directories and saving files
    return _.flattenDeep(all.map(file => {

        // is a directory?
        if (fs.statSync(`${dir}/${file}`).isDirectory()) {
            // recursively scan for files
            return getFiles(`${dir}/${file}`);
        }
        return `${dir}/${file}`;  
    })); 

}

function isReserved(tokenValue,reservedIdentifiers){  
    //return true if tokenValue equal with reserved identifier array
    return reservedIdentifiers.find(el => el === tokenValue); 
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
    func(node);
    for (var key in node) {
        if (node.hasOwnProperty(key)) {
            var child = node[key];
            //check child node is an object or not,  null may refer as a null too
            if (typeof child === 'object' && child !== null) {
                //check child is a array or not
                if (Array.isArray(child)) {
                    child.forEach(function(node) {
                        traverse(node, func);
                    });
                } else {
                    traverse(child, func);
                }
            }
        }
    }
}

function analyseCode(content, file){

    var topLevelDeclaredIdentifiers = [];
    var unDeclaredIdentifiers = [];
    var ast = esprima.parse(content);

    unDeclaredIdentifiers = findUndeclared(ast.body);
    topLevelDeclaredIdentifiers = findTopLevelDeclared(ast.body);

    return { filePath: file, topLevelDeclared: topLevelDeclaredIdentifiers, unDeclared: unDeclaredIdentifiers };
}

function findTopLevelDeclared(astBody){

    var topLevelDeclaredIdentifiers = [];

    Object.values(astBody).filter(node => {
   
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

function findUndeclared(astBody){

    var identifiersArray = {};
    var undeclaredArray = [];

    var addStatsEntry = function(identifier){
        if(!identifiersArray[identifier]){
            identifiersArray[identifier] = {calls:0, declarations:false };
        }
    };

    traverse(astBody, function(node){
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

    return undeclaredArray;

}

function findImports(files){
    let keyArray = Object.keys(files);
    keyArray.forEach(node => {
        keyArray.forEach(leaf => {
            const insect = _.intersection(files[node].unDeclared,files[leaf].topLevelDeclared);
            if(insect.length > 0){
                if (files[node].imports === undefined) files[node].imports = [];
                files[node].imports.push(leaf);
            }
        });
    });
}

function manageCommonFiles(commonFilePath){
    var fileVariables = {};
    const flatArray = getFiles(commonFilePath);

    flatArray.forEach(function(file){
        const content = fs.readFileSync(file,'utf-8');
        // console.log(file);
        fileVariables[file] = analyseCode(content,file);
        //fileVariables.push(analyseCode(content,file));
    });

    findImports(fileVariables);

    return fileVariables;
}

function findRecursivelyImports(files) {
   
    Object.keys(files).forEach(key => {
        
        if(files[key].imports){
            files[key].transitiveImports = []; //If there is no imports why should have transitive imports ??
            // transitiveImports = this[key].imports;
            findTransitiveImports(files[key].imports,files[key].transitiveImports,files);
        }
    });

    return files;
}

function findTransitiveImports(importArr, transitiveArr, fileVarArr){
    importArr.forEach(arrItem => {
        transitiveArr.push(arrItem);
        if(fileVarArr[arrItem].imports){
            findTransitiveImports(fileVarArr[arrItem].imports,transitiveArr, fileVarArr);
        }
    });
}


function findCopyArray(coFilePath,commonFiles){

    var copyArray = [];
    const customObjectArray = getFiles(coFilePath);
    const coTokens = getTokens(customObjectArray);
    const coIdentifiers = getIdentifiers(coTokens,RESERVED_IDENTIFIERS);
    const coUniqueIdentifiers = getUniqueIdentifiers(coIdentifiers);

    Object.keys(commonFiles).forEach(key => {

        const insect = _.intersection(commonFiles[key].topLevelDeclared,coUniqueIdentifiers);
        if(insect.length > 0){
            if(!commonFiles[key].imports){
                copyArray.push(commonFiles[key].filePath);
            }else{
                copyArray.push(commonFiles[key].transitiveImports);
            }
        }
    });

    return copyArray;
}

function getCustomObjects(coDirectory){
    var all = fs.readdirSync(coDirectory);

    return all.map(file => {
        if (fs.statSync(`${coDirectory}/${file}`).isDirectory()) {
            // recursively scan for files
            return `${coDirectory}/${file}`;
        }
    
    });
}

function driverFunction(commonFilePaths,customObjectFilePaths){

    const commonFileVariables = manageCommonFiles(commonFilePaths);
    const filesAfterFindTransitiveImport = findRecursivelyImports(commonFileVariables);
    var customObjectsArr = getCustomObjects(customObjectFilePaths);

    customObjectsArr.forEach(obj => {
        console.log(obj,findCopyArray(obj,filesAfterFindTransitiveImport));
    })
}

driverFunction(COMMON_FILE_PATH,CO_FILE_PATH);


