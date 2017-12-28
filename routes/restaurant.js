var express = require('express');
var mysql = require('mysql');

module.exports = function(con){
    var router = express.Router();
    router.get('/', function(req, res){
        if(req.query.lat && req.query.lon && req.query.count){
            var latitude = parseFloat(req.query.lat);
            var longitude = parseFloat(req.query.lon);
            var count = parseInt(req.query.count);
            
            var sql = mysql.format("SELECT name, code, calculate_distance(latitude, longitude, ?, ?)" +
             " AS distance FROM Hotel ORDER BY distance LIMIT ?", [latitude, longitude, count]);
            con.query(sql, function(err, rows){
                if(err)
                    throw err;
                var response = {
                    status: 'success',
                    result: rows
                }
                res.send(response);
            })
        }
    });
    return router;
}