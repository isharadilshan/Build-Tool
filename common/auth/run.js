const COMMON_FILE_PATH = '/Users/imadhushanka/Desktop/Archive/';

const glob = require('glob-all');
const util = require('util');

// options is optional
// var arr = glob.sync(COMMON_FILE_PATH+'/src/!(fef)');
// console.log(arr);

// util.promisify(glob)(COMMON_FILE_PATH + '/**/*.js').then(files => {
//     files.forEach(filePath => {
//         console.log(filePath);
//     });
// });

var files = glob.sync(
    // COMMON_FILE_PATH+'/src/!fef',//then, exclude files
    COMMON_FILE_PATH + 'src/{*.js,!(fef)/**/*.js}');

  console.log(files);
