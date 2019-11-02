const path = require('path');
const fs = require('fs');
const findUp = require('find-up');


function getFiles(base,files,result){
    files = files || fs.readdirSync(base);
    result = result || [] ;
    var ext = 'js';

    files.forEach( file => {
            var newbase = path.join(base,file);
            if ( fs.statSync(newbase).isDirectory() ){
                result = getFiles(newbase,ext,fs.readdirSync(newbase),result);
            } else {
                if ( file.substr(-1*(ext.length+1)) == '.' + ext ){
                    result.push(newbase);
                } 
            }
        }
    )
    return result;
}

ext_file_list = getFiles('/Users/imadhushanka/Desktop/Archive/src/common');
console.log(ext_file_list);


// (async () => {
// 	console.log(await findUp('package.json'));
// 	//=> '/Users/sindresorhus/unicorn.png'

// 	console.log(await findUp(['rainbow.png', 'unicorn.png']));
// 	//=> '/Users/sindresorhus/unicorn.png'

// 	console.log(await findUp(async directory => {
// 		const hasUnicorns = await findUp.exists(path.join(directory, 'unicorn.png'));
// 		return hasUnicorns && directory;
// 	}, {type: 'directory'}));
// 	//=> '/Users/sindresorhus'
// })();
