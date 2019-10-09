const FILE_PATH = '/Users/imadhushanka/Documents/Build-Tool/common';
const PUBLIC_FILE_PATH = '/Users/imadhushanka/Documents/Build-Tool/public';
const FINAL_PUBLIC_FILE_PATH = '/Users/imadhushanka/Documents/Build-Tool/public/main.js';

const gulp = require('gulp');
const concat = require('gulp-concat');
const fs = require('fs-extra');
const _ = require('lodash');

const flatFilesArray = getFlatArray(FILE_PATH);
// console.log(flatFilesArray);
concatJS(flatFilesArray);
// const tokens = getTokens(FINAL_PUBLIC_FILE_PATH);
// console.log(tokens);

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

function getTokens(FINAL_PUBLIC_FILE_PATH){

    var tokens = [];
    
    const content = fs.readFileSync(FINAL_PUBLIC_FILE_PATH,'utf-8');
    tokens.push(file,esprima.tokenize(content));

   
    //return flat array with tokens
    return _.flattenDeep(tokens);
}

function concatJS(flatFilesArray){
    flatFilesArray.forEach(file => {
        gulp.task('scripts', function() {
            console.log(file);
            return gulp.src(file)
                .pipe(concat('main.js'))
                .pipe(gulp.dest(PUBLIC_FILE_PATH));
        });
        
    })
}

const usage = require('usage');

var pid = process.pid // you can use any valid PID instead
    usage.lookup(pid, function(err, result) {
        console.log(result);
});

