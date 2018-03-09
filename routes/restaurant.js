"use strict";
var express = require('express');
var mysql = require('mysql');
var moment = require('moment');
var test = require('../tools/verification');
module.exports = function (con) {
    var router = express.Router();
    router.get('/nearby', function (req, res) {
        if (req.query.lat && req.query.lon && req.query.count) {
            //Validation of the queries have not been done. 
            var latitude = parseFloat(req.query.lat);
            var longitude = parseFloat(req.query.lon);
            var count = parseInt(req.query.count);
            var token = req.query.token;

            test.verify(con, token, function (status) {
                if (status.status == 'success') {
                    var sql = mysql.format("SELECT name, code, calculate_distance(latitude, longitude, ?, ?)" +
                        " AS distance, type, openingTime,  closingTime FROM Hotel ORDER BY distance LIMIT ?", [latitude, longitude, count]);
                    con.query(sql, function (err, rows) {
                        if (err)
                            throw err;
                        var result = [];
                        var now = moment();
                        for (var i in rows) {
                            var item = {};
                            var a = moment(rows[i].openingTime, 'hh:mm:ss');
                            var b = moment(rows[i].closingTime, 'hh:mm:ss');
                            item.name = rows[i].name;
                            item.code = rows[i].code;
                            item.distance = rows[i].distance;
                            item.type = rows[i].type;
                            if (now.isBetween(a, b)) {
                                item.opened = true;
                            }
                            else {
                                item.opened = false;
                            }
                            result.push(item);
                        }
                        var response = {
                            'status': 'success',
                            'result': result
                        };
                        res.send(response);
                    });

                    var sql = mysql.format("INSERT INTO User_Locations VALUES(?, ?, ?, now())", [status.id, latitude, longitude]);

                    con.query(sql, function(err){
                        console.log("User Location Entered");
                    })
                }
                else if(status.status == 'error'){
                    res.send(status);
                }
            });
            //Retrieves the items
        }
    });
    return router;
}