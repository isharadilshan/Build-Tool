const COMMON_FILE_PATH = '/Users/imadhushanka/Documents/Build-Tool/common';

const esprima = require('esprima');
const fs = require('fs-extra');
const _ = require('lodash');


const flatArray = getFlatArray(COMMON_FILE_PATH);
flatArray.forEach(function(file){
    const content = fs.readFileSync(file,'utf-8');
    console.log(file);
    analyseCode(content,file);

});


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

// function analyseCode(code) {
//     var ast = esprima.parse(code);
//     traverse(ast, function(node) {
//         console.log(node.type);
//     });
// }
var objArray = [];

function analyseCode(code,file){
    if(!objArray){
        objArray=[];
    }
    var ast = esprima.parse(code);
    var functionsStats = {};
    var variablesStats = {};
    var classStats = {};

    var addStatsEntryFunction = function(funcName){
        if(!functionsStats[funcName]){
            functionsStats[funcName] = {calls:0, declarations:0 };
        }
    };

    var addStatsEntryVariable = function(funcName){
        if(!variablesStats[funcName]){
            variablesStats[funcName] = {calls:0, declarations:0 };
        }
    };

    var addStatsEntryClass = function(funcName){
        if(!classStats[funcName]){
            classStats[funcName] = {calls:0, declarations:0 };
        }
    };

    traverse(ast, function(node){
        if(node.type === 'FunctionDeclaration'){
            addStatsEntryFunction(node.id.name);
            functionsStats[node.id.name].declarations++;
        }else if(node.type === 'CallExpression' && node.callee.type === 'Identifier'){
            addStatsEntryFunction(node.callee.name);
            functionsStats[node.callee.name].calls++;
        }
    });

    traverse(ast, function(node){
        if(node.type === 'VariableDeclarator'){
            addStatsEntryVariable(node.id.name);
            variablesStats[node.id.name].declarations++;
        }else if(node.type === 'CallExpression' && node.callee.type === 'Identifier'){
            addStatsEntryVariable(node.callee.name);
            variablesStats[node.callee.name].calls++;
        }
    });

    traverse(ast, function(node){
        if(node.type === 'ClassDeclaration'){
            addStatsEntryClass(node.id.name);
            classStats[node.id.name].declarations++;
        }else if(node.type === 'CallExpression' && node.callee.type === 'Identifier'){
            addStatsEntryClass(node.callee.name);
            classStats[node.callee.name].calls++;
        }
    });

    objArray.push({
        filepath: file,
        functions: functionsStats,
        variables: variablesStats,
        classes: classStats
    });

    // console.log("Functions Stats",functionsStats);
    // console.log("Variable Stats",variablesStats);
    // console.log("Class Stats",classStats);
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

function processResults(results){
    for(var name in results){
        if(results.hasOwnProperty(name)){
            var stats = results[name];
            if(stats.declarations == 0){

            }
        }
    }
}
