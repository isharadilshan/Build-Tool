const parser = require("@babel/parser")

const ast = parser.parse(" import foo from 'bar'; ", {
    sourceType: "module",
});

console.log(ast.program.body[0]);