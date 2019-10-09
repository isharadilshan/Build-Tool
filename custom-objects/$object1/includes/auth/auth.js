const testTest = require('../test');

var userName = "clientID";
var passWord = "secretKey";
var ttt = new testTest();
var constant1 = {};

constant1.something = {};

constant1.something.some = {};

function test(){

}

test.prototype.one = function(){

}


test.prototype.two = function(){

}


// function authenticateUser(user, password)
// {
//     var token = user + ":" + password;
    
//     // Base64 Encoding -> btoa
//     var hash = btoa(token); 

//     return "Basic " + hash;
// }

// function CallWebAPI() {

//     // New XMLHTTPRequest
//     var request = new XMLHttpRequest();
//     request.open("POST", "https://backendeveloper.me/login", false);
//     request.setRequestHeader("Authorization", authenticateUser(userName, passWord));  
//     request.send();
//     // view request status
//     alert(request.status);
//     response.innerHTML = request.responseText;
// }

class Auth{
    
}