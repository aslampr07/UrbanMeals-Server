"use strict"
var express = require('express');
var mysql = require("mysql");
var tokenVerify = require('../tools/verification')

module.exports = function(con){
    let router = express.Router();

    router.get('/', function(req, res){
        var token = String(req.query.token);
        
        tokenVerify.verify(con, token, function(report){
            if(report.status == "success"){
                let sql = mysql.format("SELECT firstName, lastName, website, blogger FROM User_Profile, User WHERE userID = ID AND userID = ?", [report.id]);
                con.query(sql, function(err, rows){
                    if(err){
                        throw err;
                    }
                    let response = rows[0];
                    //Getting the count of rating and photos
                    let sql = mysql.format("SELECT (SELECT COUNT(*) FROM Item_Review, Item_Rating WHERE ratingID = ID and userID = ?) as reviews, (SELECT COUNT(*) FROM Item_Pictures WHERE userID = ?) as photos FROM DUAL", [report.id, report.id]);
                    con.query(sql,function(err, rows){
                        if(err){
                            throw err;
                        }
                        response.count = rows[0];
                        let sql = mysql.format("SELECT imageURL FROM Item_Pictures WHERE userID = ? ORDER BY creationTime DESC", [report.id]);
                        con.query(sql, function(err, rows){
                            if(err){
                                throw err;
                            }
                            //Return the image url as string array, not as object array.
                            response.images = rows.map(function(obj){
                                return obj.imageURL;
                            })
                            res.json(response);
                        });
                    });
                });
            }
            else{
                res.json(report);
            }
        });
    });

    router.post('/edit', function(req, res){
        let token = req.query.token;

        tokenVerify.verify(con, token, function(report){
            if(report.status == "success"){

            }
            else{
                res.json(report);
            }
        });
    });

    return router;
}