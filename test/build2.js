RECURSIVE_DEPTH = 3;
FILE_PATH = '/Users/imadhushanka/Documents/Project-Build-Tool/common';

const esprima = require('esprima');
const babelParser = require('@babel/parser');
const traverse = require('@babel/traverse');
const fs = require('fs');
const _ = require('lodash');
const HashMap = require('hashmap');

const hashmap = new HashMap();

function getFiles(dir) {

    // get all 'files' in this directory synchronously
    var all = fs.readdirSync(dir);

    // process each checking directories and saving files
    return all.map(file => {
        // am I a directory?
        if (fs.statSync(`${dir}/${file}`).isDirectory()) {
            // recursively scan me for my files
            return getFiles(`${dir}/${file}`);
        }
        // could be something else here!!!
        return `${dir}/${file}`;  
    });
}


arr = getFiles(FILE_PATH);
// console.log(JSON.stringify(arr));

flat_array = _.flattenDeep(arr);

flat_array.forEach(function(file) {
    
    const content = fs.readFileSync(file,'utf-8');

    const tokens = [];
    tokens.push(esprima.tokenize(content));
    // console.log(tokens);
    
    // console.log("BREAK");
    const filtered_tokens = tokens[0].filter(token => {
        return token.type === 'Identifier';
    });

    const unique_filtered_tokens = _.uniqBy(filtered_tokens,function(obj){
        return obj.value;
    });
    // console.log("FIL", unique_filtered_tokens);

    unique_filtered_tokens.forEach(token => {
        hashmap.set(token.value,file);
    });


    
    
    // obj = JSON.parse(JSON.stringify(ast)); //now it an object
    // json = JSON.stringify(obj); //convert it back to json
    // console.log(file);

    // var json = JSON.stringify(ast);

    // fs.writeFile("declarations.json", json, (err) => {
    //     if (err) {
    //         console.error(err);
    //         return;
    //     };
    //     console.log("File has been created");
    // });
});

// console.log(associative_array);

hashmap.forEach(function(value, key) {
    console.log(key + " : " + value);
});




//use intersection by in lodash to get the intersection between two object arrays
