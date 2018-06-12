"use strict"
var express = require('express');
var mysql = require("mysql");
var tokenVerify = require('../tools/verification')

module.exports = function(con){
    let router = express.Router();

    //To retreive the current user's profile based on the session token.
    router.get('/', function(req, res){
        var token = String(req.query.token);
        
        tokenVerify.verify(con, token, function(report){
            if(report.status == "success"){
                let sql = mysql.format("SELECT firstName, lastName, website, (select body from User_Bio where userID = ID) as bio, blogger FROM User_Profile, User WHERE userID = ID AND userID = ?", [report.id]);
                con.query(sql, function(err, rows){
                    if(err){
                        throw err;
                    }
                    let response = rows[0];
                    //If the bio is null
                    if(response.bio == null)
                        response.bio = "";
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

    //This function is used to edit the profile of the user based on the session token.
    router.post('/edit', function(req, res){
        let token = req.query.token;
        let firstName = req.body.firstname;
        let lastName = req.body.lastname;
        let website = req.body.website;
        let bio = req.body.bio; 



        tokenVerify.verify(con, token, function(verificationReport){
            if(verificationReport.status == "success"){
                verfiydata(firstName, lastName, website, bio, function(report){
                    if(report.status == "success"){
                        let data = {
                            "firstName" : firstName,
                            "lastName" : lastName,
                            "website" : website
                        };
                        let sql = mysql.format("UPDATE User_Profile SET ? WHERE userID = ?", [data, [verificationReport.id]]);
                        con.query(sql, function(err, rows){
                            if(err){
                                throw err;
                            }
                            let sql = mysql.format("INSERT INTO User_Bio VALUES(? , ?) ON DUPLICATE KEY UPDATE body = ?", [verificationReport.id, bio, bio]);
                            con.query(sql, function(err, rows){
                                if(err){
                                    throw err;
                                }
                                let response = {
                                    "status" : "success"
                                }
                                res.json(response);
                            })
                        });
                    }
                    else{
                        res.json(report);
                    }
                });
            }
            else{
                res.json(report);
            }
        });
    });

    function verfiydata(firstname, lastname, website, bio, cb){
        let response = {
            "status" : "success",
            "type" : []
        }
        if(!/^[A-z ]+$/.test(firstname)){
            response.status = "error";
            response.type.push(104);
        }
        if(!/^[A-z ]+$/.test(lastname)){
            response.status = "error";
            response.type.push(105);
        }
        if(bio.length > 150){
            response.status = "error";
            response.type.push(119);
        }
        if(response.status == "error"){
            cb(response);
        }
        else{
            delete response.type;
            cb(response);
        }
    }

    return router;
}