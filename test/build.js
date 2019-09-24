RECURSIVE_DEPTH = 3;
FILE_PATH = '/Users/imadhushanka/Documents/Project-Build-Tool/common';

const babelParser = require('@babel/parser');
const esprima = require('esprima');
const fs = require('fs');

Object.defineProperty(Array.prototype, 'flat', {
    value: function(depth = 1) {
      return this.reduce(function (flat, toFlatten) {
        return flat.concat((Array.isArray(toFlatten) && (depth>1)) ? toFlatten.flat(depth-1) : toFlatten);
      }, []);
    }
});

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


flat_array = arr.flat([RECURSIVE_DEPTH]);
// console.log(arr.flat([RECURSIVE_DEPTH]));

flat_array.forEach(function(file) {
    
    const content = fs.readFileSync(file,'utf-8');
    // const ast = babelParser.parse(content,{
    //     sourceType: 'module',
    //     plugins: [
    //         // enable jsx and flow syntax
    //         "jsx",
    //         "flow"
    //     ]
    // });

    const functionNames = [];
    const tokens = [];
    tokens.push(esprima.tokenize(content));
    // console.log(tokens);
    console.log("BREAK");
    var filtered_tokens = tokens.filter(function(token){
        return token.type == 'Identifier';
    });
    console.log(filtered_tokens);

    esprima.tokenize(content);
    // console.log(esprima.tokenize(content));
    
    
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