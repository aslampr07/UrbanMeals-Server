var express = require('express');

module.exports = function(con){
    var router = express.Router();
    router.get('/', function(req, res){
        res.send("Hello World");
    });
    return router;
}