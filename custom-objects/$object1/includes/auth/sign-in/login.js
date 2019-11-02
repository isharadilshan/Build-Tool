function authenticateUser(user, password)
{
    var token = user + ":" + password;
    
    // Base64 Encoding -> btoa
    var hash = btoa(token); 

    return "Basic " + hash;
}

const publicTokens = getTokens(publicArray);


class TEST{
    
}
class Test2{

}

var test = new Test2();

signInOut();

signInOut();

const obj ={};