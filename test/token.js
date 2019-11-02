const Config = {
    FEF_FOLDER: __dirname + '/src/fef',
    SRC_FOLDER: __dirname ,
    DIST_FOLDER: __dirname + '/dist',
    COMMON_FOLDER_NAME: `test`
};

const esprima = require('esprima');
const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const glob = require('glob');
const util = require('util');
const ncp = require('ncp');
const rimraf = require("rimraf");
const chalk = require('chalk');
const archiver = require('archiver');

const Builder = {

    /**
     * return array of identifiers for files in one custom object
     *  * @param {*} coFilesArr => file array of one custom object
     */
    findCustomObjectIdentifiers: function  (coFilesArr){
        
        var tokens = [];
        var identifiers = [];

        coFilesArr.forEach(file => {
            const content = fs.readFileSync(file,'utf-8');//read file content 

            try{
                tokens.push(esprima.tokenize(content));//push tokens in each file to tokens array
            }catch(error){
                throw new Error(`Cannot tokenize ${file} content.`);
            }  
        });

        identifiers = _.flattenDeep(tokens).filter(token => {//filter only identifiers by tokens
            return token.type === 'Identifier';
        });

        const uniqueIdentifiers = _.uniqBy(identifiers, id => {//get only unique identifiers
            return id.value;
        });

        const coIdentifiers = uniqueIdentifiers.map(id => id.value);//get only value of the identifiers
        return coIdentifiers;

    },

    /**
     * return array of common file objects with transitive imports and file path
     * @param {*} commonFilesArr => file array of all common files
     */
    analyseCommonFiles: function (commonFilesArr){

        var fileObjectsArr = {};
        
        commonFilesArr.forEach(file => {
            fileObjectsArr[file] = Builder.analyseFile(file);//get file object with declared, undeclared and file path
        });

        Object.keys(fileObjectsArr).forEach(fileObj => {
            if(fileObjectsArr[fileObj].undeclared){
                Object.keys(fileObjectsArr).forEach(anyFileObj => {//compare each file with other common files
                    const intersect = _.intersection(fileObjectsArr[fileObj].undeclared,fileObjectsArr[anyFileObj].declared);//check whether undeclared identifiers are declared in other files
                    if(intersect.length > 0){//if intersect add that file in to imports
                        if (fileObjectsArr[fileObj].imports === undefined) fileObjectsArr[fileObj].imports = [];
                        fileObjectsArr[fileObj].imports.push(anyFileObj);
                    }
                });
            }
        });

        Object.keys(fileObjectsArr).forEach(fileObj => {
            if(fileObjectsArr[fileObj].imports){//If there is no imports why we should have transitive imports ??
                fileObjectsArr[fileObj].transitiveImports = [];//if import array is not empty check recursively for transitive imports
                Builder.findTransitiveRecursively(fileObjectsArr[fileObj].imports,fileObjectsArr[fileObj].transitiveImports,fileObjectsArr);
            }
        });
        
        return fileObjectsArr;
    },

    /**
     * analyse the content of one common file
     * @param {*} file
     */
    analyseFile: function (file){

        var declarations = [];

        const content = fs.readFileSync(file,'utf-8');//read file content

        try{
            var ast = esprima.parse(content);//get AST tree using esprima
        }catch(error){
            throw new Error(`Cannot parse ${file} content`);
        }

        declarations = Builder.findDeclaration(ast.body);

        return { filepath: file, declared: declarations.declared , undeclared: declarations.undeclared};

    },

    /**
     * recursive function which traverse down the AST tree
     * @param {*} node 
     * @param {*} func => callback function of recursive 
     */
    traverse: function (node, func) {

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
                            Builder.traverse(node, func);//call recursive if node has childrens
                        });
                    } else {
                        Builder.traverse(child, func);
                    }
                }
            }
        }
    },

    /**
     * find declared and undeclared identifiers of given common file
     * @param {*} astBody => AST tree body one of common file
     */
    findDeclaration: function (astBody){

        var identifiersArr = {};
        var declaredArr = [];
        var undeclaredArr = [];

        var addStatsEntry = function(identifier){
            if(!identifiersArr[identifier]){//initiate object with identifier as key
                identifiersArr[identifier] = { calls:0, declared:false };
            }
        };

        Builder.traverse(astBody, function(node){//callback of recursive function
            if(node.type === 'ClassDeclaration'){
                addStatsEntry(node.id.name);
                identifiersArr[node.id.name].declared=true;
            }else if(node.type === 'FunctionDeclaration'){
                addStatsEntry(node.id.name);
                identifiersArr[node.id.name].declared=true; 
            }else if(node.type === 'VariableDeclaration' && node.kind === 'const'){//filter only constants
                Object.values(node.declarations).filter(constant => {
                    addStatsEntry(constant.id.name);
                    identifiersArr[constant.id.name].declared=true;
                });
            }else if(node.type === 'CallExpression' && node.callee.type === 'Identifier'){
                addStatsEntry(node.callee.name);
                identifiersArr[node.callee.name].calls++;//check this identifier called in some where
            }
        });

        Object.keys(identifiersArr).forEach(identifier => {
            if(identifiersArr[identifier].declared){
                declaredArr.push(identifier);//if identifier is declared push in to declared array
            }else{
                undeclaredArr.push(identifier);//if identifier is undeclared push in to undeclared array
            }
        });

        return { declared: declaredArr, undeclared: undeclaredArr };
    },

    /**
     * recursive function to find transitive imports
     * @param {*} importArr => import array of one common file object
     * @param {*} transitiveArr => transitive array of one common file object
     * @param {*} fileObjectsArr => commmon file objects associative array
     */
    findTransitiveRecursively: function (importArr, transitiveArr, fileObjectsArr){
        importArr.forEach(arrItem => {
            transitiveArr.push(arrItem);
            if(fileObjectsArr[arrItem].imports){//If there is no imports why we should have transitive imports ??
                Builder.findTransitiveRecursively(fileObjectsArr[arrItem].imports,transitiveArr, fileObjectsArr);//call recursive if imports array is not empty
            }
        });
    },



    findCopyFiles: function (){

        var copyFilesArr = [];
        var commonFiles = glob.sync(Config.SRC_FOLDER + '/src/{*.js,!(fef)/**/*.js}');
        var commonFileContents = Builder.analyseCommonFiles(commonFiles);

        fs.readdirSync(Config.FEF_FOLDER).forEach(folderName => {

            let coFolderPath = path.join(Config.FEF_FOLDER,folderName);//path only used one time
            
            if(fs.lstatSync(coFolderPath).isDirectory() && folderName.charAt(0) === '$'){
            
                var coIdentifiers = Builder.findCustomObjectIdentifiers(glob.sync(coFolderPath+'/source/{behaviors,includes/js}/**/*.js'));

                Object.keys(commonFileContents).forEach(key => {
                    const intersect = _.intersection(commonFileContents[key].declared, coIdentifiers);
                    if(intersect.length > 0){
                        if(!commonFileContents[key].imports){
                            copyFilesArr.push(commonFileContents[key].filepath)
                        }else{
                            copyFilesArr.push(commonFileContents[key].filepath,commonFileContents[key].transitiveImports);
                        }
                    }
                });
                Builder.copyFilesToDestination(_.uniq(_.flattenDeep(copyFilesArr)),coFolderPath);
            }
        });
        // return copyFilesArr;
    },

    copyFilesToDestination: function (copyFilesArr,folderPath){

        copyFilesArr.forEach(file => {
            var targetFile = path.join(folderPath,'source','includes',Config.COMMON_FOLDER_NAME);
            // console.log(targetFile);
            // if (fs.existsSync(targetFile)) {
            //     rimraf(targetFile);
            // }
            // destination.txt will be created or overwritten by default.
            fs.copy(file, targetFile, (err) => {
                if (err) throw err;
                console.log('source.txt was copied to destination.txt');
            });
        });
    },

    createZip: async function () {
        //clean dist folder
        await util.promisify(rimraf)(Config.DIST_FOLDER);
        await util.promisify(fs.mkdir)(Config.DIST_FOLDER);

        // create a file to stream archive data to.
        let output = fs.createWriteStream(Config.DIST_FOLDER + '/Archive.zip');
        let archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });

        let zippingProcess = new Promise((resolve, reject) => {
            // 'close' event is fired only when a file descriptor is involved
            output.on('close', function () {
                resolve(`Archive created`);
            });
            output.on('end', function () {
                Log.info('Data has been drained');
                resolve(`Archive created`);
            });
            archive.on('warning', function (err) {
                if (err.code === 'ENOENT') {
                    Log.error(err.message)
                } else {
                    throw err;
                }
            });
            archive.on('error', function (err) {
                reject(`stderr: ${err.message}`);
                throw err;
            });

            // pipe archive data to the file
            archive.pipe(output);
            //archive directories
            let fefFolderList = fs.readdirSync(Config.FEF_FOLDER).filter(itemName => fs.lstatSync(path.join(Config.FEF_FOLDER, itemName)).isDirectory());
            for (const fefFolder of fefFolderList) {
                archive.directory(`${Config.FEF_FOLDER}/${fefFolder}`, fefFolder);
            }
            // finalize the archive (ie we are done appending files but streams have to finish yet)
            // 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
            archive.finalize();
        });

        return zippingProcess;
    }

}

const Log = {
    done: function(message) {
        console.log(chalk['green'](message));
    },

    error: function (message) {
        console.log(chalk.white.bgRed(message));
    },

    info: function (message) {
        console.log(chalk['gray'](message));
    },

    completed: function (message) {
        console.log(chalk.black.bgGreenBright(message));
    }
}

// var arr = Builder.findCopyFiles();
// console.log(arr);

// Builder.createZip();

Builder.findCopyFiles();

