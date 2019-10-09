const COMMON_FILE_PATH = '/Users/imadhushanka/Documents/Build-Tool/common';

const esprima = require('esprima');
const fs = require('fs-extra');
const _ = require('lodash');

const flatArray = getFlatArray(COMMON_FILE_PATH);
var fileVariables = [];

flatArray.forEach(function(file){
    const content = fs.readFileSync(file,'utf-8');
    console.log(file);
    fileVariables.push(analyseCode(content,file));

});


function getFiles(dir) {

    // get all 'files' in this directory synchronously
    var all = fs.readdirSync(dir);

    // process each checking directories and saving files
    return all.map(file => {
        // console.log(file);
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

function analyseCode(content, file){

    var topLevels = [];
    var unDeclaredIdentifiers = [];
    var ast = esprima.parse(content);

    unDeclaredIdentifiers = findUndeclared(ast);

    Object.values(ast.body).filter(node => {
   
        if(node.type === 'ClassDeclaration' || node.type === 'FunctionDeclaration'){

            topLevels.push(node.id.name);

        }else if(node.type === 'VariableDeclaration' && node.kind === 'const'){

            Object.values(node.declarations).filter(constant => {
                topLevels.push(constant.id.name);
            });
        }
    
    });

    return { filePath: file, topLevelDeclared: topLevels, unDeclared: unDeclaredIdentifiers };
}

function traverse(node, func) {
    func(node);//1
    for (var key in node) { //2
        if (node.hasOwnProperty(key)) { //3
            var child = node[key];
            if (typeof child === 'object' && child !== null) { //4

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

    console.log(undeclaredArray);
    return undeclaredArray;

}

console.log(fileVariables);
