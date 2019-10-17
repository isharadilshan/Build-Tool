function findRecursivelyImports(fileVariables) {
   
    Object.keys(fileVariables).forEach(key => {
        
        if(fileVariables[key].imports){
            fileVariables[key].transitiveImports = []; //If there is no imports why should have transitive imports ??
            // transitiveImports = this[key].imports;
            findTransitiveImports(fileVariables[key].imports,fileVariables[key].transitiveImports,fileVariables);
        }
    });

    console.log(fileVariables); 
}

function findTransitiveImports(importArr, transitiveArr, fileVarArr){
    importArr.forEach(arrItem => {
        transitiveArr.push(arrItem);
        if(fileVarArr[arrItem].imports){
            findTransitiveImports(fileVarArr[arrItem].imports,transitiveArr, fileVarArr);
        }
    });
}

var fileVariables = { '/Users/imadhushanka/Documents/Build-Tool/common/auth/auth.js':
{ filePath:
   '/Users/imadhushanka/Documents/Build-Tool/common/auth/auth.js',
  topLevelDeclared: [ 'testTest', 'AUTH_TOKEN', 'test', 'Auth', 'getTokens' ],
  unDeclared: [ 'require', 'testoo' ],
  imports:
   [ '/Users/imadhushanka/Documents/Build-Tool/common/new/new2.js' ] },
'/Users/imadhushanka/Documents/Build-Tool/common/auth/role-guard.js':
{ filePath:
   '/Users/imadhushanka/Documents/Build-Tool/common/auth/role-guard.js',
  topLevelDeclared: [ 'FunctionGuard' ],
  unDeclared: [ 'setTimeout', 'clearTimeout' ] },
'/Users/imadhushanka/Documents/Build-Tool/common/auth/sign-in/login.js':
{ filePath:
   '/Users/imadhushanka/Documents/Build-Tool/common/auth/sign-in/login.js',
  topLevelDeclared:
   [ 'authenticateUser', 'publicTokens', 'TEST', 'Test2', 'obj' ],
  unDeclared: [ 'btoa', 'getTokens', 'signInOut', 'signInOut' ],
  imports:
   [ '/Users/imadhushanka/Documents/Build-Tool/common/auth/auth.js',
     '/Users/imadhushanka/Documents/Build-Tool/common/new/new2.js',
     '/Users/imadhushanka/Documents/Build-Tool/common/test/test.js' ] },
'/Users/imadhushanka/Documents/Build-Tool/common/new/new2.js':
{ filePath:
   '/Users/imadhushanka/Documents/Build-Tool/common/new/new2.js',
  topLevelDeclared: [ 'signInOut', 'testoo' ],
  unDeclared: [],
  imports: [ '/Users/imadhushanka/Documents/Build-Tool/common/test.js',
  '/Users/imadhushanka/Documents/Build-Tool/common/test/test.js' ] },
'/Users/imadhushanka/Documents/Build-Tool/common/test/test.js':
{ filePath:
   '/Users/imadhushanka/Documents/Build-Tool/common/test/test.js',
  topLevelDeclared: [ 'Test', 'btoa', 'testTest' ],
  unDeclared: [ 'getTokens' ],
  imports:
   [ '/Users/imadhushanka/Documents/Build-Tool/common/test.js' ] },
'/Users/imadhushanka/Documents/Build-Tool/common/test.js':
{ filePath: '/Users/imadhushanka/Documents/Build-Tool/common/test.js',
  topLevelDeclared: [ 'testTest', 'arr', 'lol', 'userName' ],
  unDeclared: [] } };

findRecursivelyImports(fileVariables);

