const COMMON_FILE_PATH = '/Users/imadhushanka/Desktop/Archive/src/common';
const CO_FILE_PATH = '/Users/imadhushanka/Desktop/Archive/src/fef';
const RESERVED_IDENTIFIERS = ['console','log','return','require','prototype','slice','Facade'];

const esprima = require('esprima');
const fs = require('fs-extra');
const _ = require('lodash');

function getFiles(dir) {//recursively find files inside a given folder
    
    if(dir === undefined){
        return [];
    }
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

function isReserved(tokenValue,reservedIdentifiers){//check whether token is default identifier or not
    //return true if tokenValue equal with reserved identifier array
    return reservedIdentifiers.find(el => el === tokenValue); 
}

function getTokens(fileArray){//get all tokens from files inside in one custom object folder

    var tokens = [];

    fileArray.forEach(function(file){
    
        const content = fs.readFileSync(file,'utf-8');
        //tokenize the file content and push to tokens array for each and every file inside in a custom object
        tokens.push(esprima.tokenize(content));

    });
    //return array with tokens
    return _.flattenDeep(tokens);
}

function getIdentifiers(tokens,reservedIdentifiers){//filter unique identifiers except reserved by given set of tokens

    var filteredTokens = [];

    filteredTokens = tokens.filter(token => {
        //filter tokens which are identifiers except default identifiers
        return token.type === 'Identifier' && !isReserved(token.value,reservedIdentifiers);//map and filter in same function
    });

    const identifiers = _.uniqBy(filteredTokens,function(obj){
        return obj.value;
    });

    const uniqueIdentifiers = identifiers.map(element => element.value);
    return uniqueIdentifiers;

}

function traverse(node, func) {//recursive function which traverse down the AST tree

    func(node);
    for (var key in node) {
        if (node.hasOwnProperty(key)) {
            var child = node[key];
            //check child node is an object or not,  null may refer as a object too
            if (typeof child === 'object' && child !== null) {
                //check child is contain array of nodes
                if (Array.isArray(child)) {
                    //check each node at the same level
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

function findTopLevelDeclared(astBody){//find top level declared functions, constants and variables

    var topLevelDeclaredIdentifiers = [];

    Object.values(astBody).filter(node => {//always top levels reside in the first depth
   
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

function findUndeclared(astBody){//find undeclared identifiers of given file

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
            identifiersArray[node.callee.name].calls++;//check whether this is returns only undeclaed ones or not and whether have to check call times too
            if(!identifiersArray[node.callee.name].declarations){//&&identifiersArray[node.callee.name].calls>0
                undeclaredArray.push(node.callee.name);//push only undeclared identifiers to array
            }
        }
    });

    return undeclaredArray;

}

function analyseFileContent(file){//analyse the content of each and every file in common folder

    var topLevelDeclaredIdentifiers = [];
    var unDeclaredIdentifiers = [];

    const content = fs.readFileSync(file,'utf-8');//get file content
    var ast = esprima.parse(content);//get AST tree using esprima

    unDeclaredIdentifiers = findUndeclared(ast.body);
    topLevelDeclaredIdentifiers = findTopLevelDeclared(ast.body);

    return { filePath: file, topLevelDeclared: topLevelDeclaredIdentifiers, unDeclared: unDeclaredIdentifiers };//return object with file data
}

function findFileImports(fileContents){//check whether any common file import content with other common files
    var keyArray = Object.keys(fileContents);
    keyArray.forEach(fileObj => {
        keyArray.forEach(anyFileObj => {
            const insect = _.intersection(fileContents[fileObj].unDeclared,fileContents[anyFileObj].topLevelDeclared);
            if(insect.length > 0){
                if (fileContents[fileObj].imports === undefined) fileContents[fileObj].imports = [];
                fileContents[fileObj].imports.push(anyFileObj);
            }
        });
    });
}

function findTransitiveImports(fileContentsArray) {//find whether common files have transitive imports with other common files
   
    Object.keys(fileContentsArray).forEach(key => {
        
        if(fileContentsArray[key].imports){//If there is no imports why we should have transitive imports ??
            fileContentsArray[key].transitiveImports = [];
            findTransitiveRecursively(fileContentsArray[key].imports,fileContentsArray[key].transitiveImports,fileContentsArray);
        }
    });

    return fileContentsArray;
}

function findTransitiveRecursively(importArr, transitiveArr, fileContentArr){//recursive function to find transitive imports
    importArr.forEach(arrItem => {
        transitiveArr.push(arrItem);
        if(fileContentArr[arrItem].imports){//If there is no imports why we should have transitive imports ??
            findTransitiveImports(fileContentArr[arrItem].imports,transitiveArr, fileContentArr);
        }
    });
}

function manageCommonFiles(commonFolderPath){

    var fileContentsArray = {};//associate array to hold data about each file in common,file path is the key
    const filesArray = getFiles(commonFolderPath);

    var extension = '.js';

    var xfiles = filesArray.filter(function(file){
        return file.indexOf(extension) !== -1;
    });

    xfiles.forEach(function(file){
        fileContentsArray[file] = analyseFileContent(file);
    });

    findFileImports(fileContentsArray);//find imports from files with other files inside the common folder
    findTransitiveImports(fileContentsArray);//find transitive import files in common files

    return fileContentsArray;
}






function findCopyFiles(coFolderPath,commonFilesContents){//get array of common files which are used by one custom object to copy

    var copyFilesArray = [];
    const filesInsideOneCustomObject = getFiles(coFolderPath);//get all the files inside a custom object


    var extension = '.js';

    var xfiles = filesInsideOneCustomObject.filter(function(file){
        return file.indexOf(extension) !== -1;
    });



    const coTokens = getTokens(xfiles);
    const coIdentifiers = getIdentifiers(coTokens,RESERVED_IDENTIFIERS);//filter only identifiers inside the custom object

    Object.keys(commonFilesContents).forEach(key => {

        const insect = _.intersection(commonFilesContents[key].topLevelDeclared,coIdentifiers);//check whether top level declared identifiers are intersect with custom object identifiers
        if(insect.length > 0){
            if(!commonFilesContents[key].imports){//if intersect and intersecting common file haven't any imports push it's file path to copy files array
                copyFilesArray.push(commonFilesContents[key].filePath);
            }else{
                copyFilesArray.push(commonFilesContents[key].transitiveImports,commonFilesContents[key].filePath);//if intersect and intersecting common file have imports push it's file path and transitive imports to copy files array
            }
        }
    });

    return copyFilesArray;
}

function getFolderPathsOfCustomObjects(coDirectory){//return only custom object directories

    var all = fs.readdirSync(coDirectory);

    return all.map(file => {
        if (fs.statSync(`${coDirectory}/${file}`).isDirectory()) {//check whether is directory
            return `${coDirectory}/${file}`;
        }
    });
}

function copyFilesToDestination(copyFilePaths, customObjectFolderPath){//copy relevant common files to custom object directories 
    copyFilePaths.forEach(file => {
        const copyPath = customObjectFolderPath+'/include'+file.substring(file.lastIndexOf('/'));
        // const copyPath = customObjectFolderPath+'includes/'+file.substring(file.indexOf('/common/')+8);
        fs.copy(file, copyPath, err => {
            if (err) return console.error(err)
          
            console.log('success!')
          });//,file.lastIndexOf('/')
        //fs.copyFileSync
    })
}

function driverFunction(commonFolderPath,customObjectsFolderPath){

    const commonFilesContentsArray = manageCommonFiles(commonFolderPath);
    const customObjectsArray = getFolderPathsOfCustomObjects(customObjectsFolderPath);

    customObjectsArray.forEach(obj => {
        const copyFilesArray = findCopyFiles(obj,commonFilesContentsArray);
        const filteredCopyFilesArray =  _.uniq(_.flattenDeep(copyFilesArray));
        copyFilesToDestination(filteredCopyFilesArray,obj);
        // console.log(obj,filteredCopyFilesArray,filteredCopyFilesArray.length);
    });
}


driverFunction(COMMON_FILE_PATH,CO_FILE_PATH);