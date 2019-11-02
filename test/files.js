const COMMON_FILE_PATH = '/Users/imadhushanka/Desktop/Archive/src/common';

const esprima = require('esprima');
const fs = require('fs-extra');
const _ = require('lodash');



function getFlattenFiles(dir) {//recursively find files inside a given folder
    
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

function getFiles(dir) {//recursively find files inside a given folder
   
    // get all 'files' in this directory synchronously
    var all = fs.readdirSync(dir);

    // process each checking directories and saving files
    return (all.map(file => {

        // is a directory?
        if (fs.statSync(`${dir}/${file}`).isDirectory()) {
            console.log(fs.statSync(`${dir}/${file}`).isDirectory());
            // recursively scan for files
            return getFiles(`${dir}/${file}`);
        }
        return `${dir}/${file}`;  
    })); 
}

var dirs = getFiles(COMMON_FILE_PATH);

dirs.forEach(file => {
    if(file===undefined){
        console.log.length("UNDEFINED");
    }
});

// console.log(getFlattenFiles(COMMON_FILE_PATH));

// console.log(getFiles(COMMON_FILE_PATH));

// console.log(__dirname);

// var path = require('path');
// var appDir = path.dirname(require.main.filename);



function getCommonFiles(){
    var commonFiles = glob.sync(Config.SRC_FOLDER + '/src/{*.js,!(fef)/**/*.js}');
    // console.log(commonFiles);
    // console.log(analyseCommonFiles(commonFiles));

    var commonFileContents = analyseCommonFiles(commonFiles);
    Object.keys(commonFileContents).forEach(key => {

    })
}

// getCOFolders();

getCommonFiles();

// console.log(__dirname);
