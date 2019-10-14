function findRecursivelyImports(objArr) {
    console.log(objArr);
    for (var node in objArr) { //2
        // console.log(node);
        if (node.imports) { //3
            // console.log(objArr[node]);
            // var child = node[key];

            // if (typeof child === 'object' && child !== null) { //4
            //     //create a flag or something in the first recursive depth and pass it to the function
            //     if (Array.isArray(child)) {
            //         child.forEach(function(node) { //5
            //             traverse(node, func);
            //         });
            //     } else {
            //         traverse(child, func); //6
            //     }
            // }
        }
    }
}

var testNode = [ { filePath:
    '/Users/imadhushanka/Documents/Build-Tool/common/auth/auth.js',
   topLevelDeclared: [ 'testTest', 'AUTH_TOKEN', 'test', 'Auth', 'getTokens' ],
   unDeclared: [ 'require', 'testoo' ] },
 { filePath:
    '/Users/imadhushanka/Documents/Build-Tool/common/auth/role-guard.js',
   topLevelDeclared: [ 'FunctionGuard' ],
   unDeclared: [ 'setTimeout', 'clearTimeout' ] },
 { filePath:
    '/Users/imadhushanka/Documents/Build-Tool/common/auth/sign-in/login.js',
   topLevelDeclared:
    [ 'authenticateUser', 'publicTokens', 'TEST', 'Test2', 'obj' ],
   unDeclared: [ 'btoa', 'getTokens', 'signInOut', 'signInOut' ],
   imports:
    [ '/Users/imadhushanka/Documents/Build-Tool/common/auth/auth.js',
      '/Users/imadhushanka/Documents/Build-Tool/common/new/new2.js',
      '/Users/imadhushanka/Documents/Build-Tool/common/test/test.js' ] },
 { filePath:
    '/Users/imadhushanka/Documents/Build-Tool/common/new/new2.js',
   topLevelDeclared: [ 'signInOut' ],
   unDeclared: [] },
 { filePath:
    '/Users/imadhushanka/Documents/Build-Tool/common/test/test.js',
   topLevelDeclared: [ 'Test', 'btoa', 'testTest' ],
   unDeclared: [ 'getTokens' ],
   imports:
    [ '/Users/imadhushanka/Documents/Build-Tool/common/auth/auth.js' ] },
 { filePath: '/Users/imadhushanka/Documents/Build-Tool/common/test.js',
   topLevelDeclared: [ 'testTest', 'arr', 'lol', 'userName' ],
   unDeclared: [] } ];



findRecursivelyImports(testNode);