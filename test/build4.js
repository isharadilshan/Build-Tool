const COMMON_FILE_PATH = '/Users/imadhushanka/Documents/Build-Tool/common';
const CO_FILE_PATH = '/Users/imadhushanka/Documents/Build-Tool/custom-objects';
const RESERVED_IDENTIFIERS = ['console','log','return','require','prototype','slice','Facade'];
const DESTINATION = '/Users/imadhushanka/Documents/Build-Tool/custom-objects/$object1/includes/';

const esprima = require('esprima');
const fs = require('fs-extra');
const _ = require('lodash');

const commonArray = getFlatArray(COMMON_FILE_PATH);
const commonTokens = getTokens(commonArray);
// console.log(commonTokens);

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
    console.time();
    var arr = getFiles(filePath);
    console.timeEnd();
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

const usage = require('usage');

var pid = process.pid // you can use any valid PID instead
    usage.lookup(pid, function(err, result) {
        console.log(result);
});

