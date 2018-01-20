"use strict";

var express = require('express');
var mysql = require('mysql');

module.exports = function(con){
    var router = express.Router()
    
    router.post('/', function(req, res){
        var final = [];
        for(var i in req.body){
            var ar = [];
            ar.push(i, req.body[i])
            final.push(ar);
        }
        var sql = mysql.format('INSERT INTO Survey(qNO, answerNO) VALUES ?', [final]);
        con.query(sql, function(err, result){
            if(err)
            {
                throw err;
            }
            res.send("Successful");
        })
    });
    return router;
}