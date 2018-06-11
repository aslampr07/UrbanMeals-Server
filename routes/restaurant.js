"use strict";
var express = require('express');
var mysql = require('mysql');
var moment = require('moment');
var tokenVerify = require('../tools/verification');
module.exports = function (con) {
    var router = express.Router();

    //Get the list of the nearby hotels
    router.get('/nearby', function (req, res) {
        if (req.query.lat && req.query.lon && req.query.count) {
            //Validation of the queries have not been done. 
            var latitude = parseFloat(req.query.lat);
            var longitude = parseFloat(req.query.lon);
            var count = parseInt(req.query.count);
            var token = req.query.token;

            tokenVerify.verify(con, token, function (status) {
                if (status.status == 'success') {
                    /* The count limit of the sql has been removed.
                        Turn it back on after developement completed.
                        
                    var sql = mysql.format("SELECT name, code, calculate_distance(latitude, longitude, ?, ?)" +
                        " AS distance, type, openingTime, closingTime, (SELECT AVG(rating) FROM Hotel_Rating WHERE hotelID = h.ID) as rating FROM Hotel h ORDER BY distance LIMIT ?", [latitude, longitude, count]);*/
                        var sql = mysql.format("SELECT name, code, calculate_distance(latitude, longitude, ?, ?)" +
                        " AS distance, type, openingTime, closingTime, (SELECT AVG(rating) FROM Hotel_Rating WHERE hotelID = h.ID) as rating FROM Hotel h WHERE enabled = 'Y' ORDER BY distance", [latitude, longitude]);
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

                            //If the rating is null, then set it to zero.
                            if(!rows[i].rating){
                                item.rating = 0;
                            }
                            else{
                                item.rating = Number(rows[i].rating.toFixed(2));
                            }

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
                        res.json(response);
                        console.log("Accessed Nearby Hotels");
                    });

                    var sql = mysql.format("INSERT INTO User_Locations VALUES(?, ?, ?, now())", [status.id, latitude, longitude]);
                    con.query(sql, function(err){
                    })
                }
                else if(status.status == 'error'){
                    res.send(status);
                }
            });
            //Retrieves the items
        }
    }); 

    //Adds rating to the hotels
    router.post('/rating', function(req, res){
        var token = String(req.query.token);
        
        var hotelCode = String(req.body.hotelcode);
        var rating = Number(req.body.rating);

        tokenVerify.verify(con, token, function(check){
            if(check.status == 'success'){
                var userID = check.id;
                var sql = mysql.format("SELECT ID FROM Hotel WHERE code = ?", [hotelCode]);
                con.query(sql, function(err, rows){
                    if(err){
                        throw err;
                    }
                    if(rows.length > 0){
                        var hotelID = rows[0].ID;

                        var sql = mysql.format("INSERT INTO Hotel_Rating(userID, hotelID, rating, creationTime) VALUES (?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE rating = ?, creationTime = NOW()", [userID, hotelID, rating, rating]);
                        con.query(sql, function(err, rows){
                            if(err){
                                throw err;
                            }
                            var response = {
                                'status' : 'success'
                            }
                            res.json(response);
                        })
                    }
                    else{
                        var response = {
                            'status' : 'error',
                            'type' : [115]
                        }
                        res.json(response);
                    }
                });

            }
            else{
                res.json(check);
            }
        });
    });


    //Get the rating from the hotel
    router.get('/rating', function(req, res){
        var hotelCode = String(req.query.hotelcode);
        
        var sql = mysql.format("SELECT ID FROM Hotel WHERE code = ?", [hotelCode]);
        con.query(sql, function(err, rows){
            if(err){
                throw err;
            }
            if(rows.length > 0){
                var hotelID = rows[0].ID;
                var sql = mysql.format("SELECT AVG(rating) as rating FROM Hotel_Rating WHERE hotelID = ?", [hotelID]);
                con.query(sql, function(err, rows){
                    if(err){
                        throw err;
                    }
                    if(rows[0].rating == null){
                        var response = {
                            'status' : 'success',
                            'rating' : 0.0
                        }
                        res.json(response);
                    }
                    else{
                        var response = {
                            'status' : 'success',
                            'rating' : Number(rows[0].rating.toFixed(2))
                        }
                        res.json(response);
                    }
                });
            }
            else{
                var response = {
                    'status' : 'error',
                    'type' : [115]
                }
                res.json(response);
            }
        })
    });

    //Get the hotel Profile from the hotel
    /**
     * @deprecated
     */
    router.get('/profile', function(req, res){
        var hotelCode = String(req.query.hotelcode);
        var token = String(req.query.token);

        tokenVerify.verify(con, token, function(check){
            if(check.status == 'success'){
                var sql = mysql.format("SELECT ID FROM Hotel WHERE code = ?", [hotelCode]);
                con.query(sql, function(err, rows){
                    if(err){
                        throw err;
                    }
                    if(rows.length > 0){
                        var hotelID = rows[0].ID;
                        var sql = mysql.format("SELECT name, place, openingTime, closingTime, phone, latitude, longitude, street, city, pincode, body from Hotel, Hotel_Profile p, Hotel_Description d WHERE ID = ? AND ID = p.hotelID AND ID = d.hotelID", [hotelID]);
                        con.query(sql, function(err, rows){
                            if(err){
                                throw err;
                            }
                            var result = {
                                'name' : rows[0].name,
                                'place' : rows[0].place,
                                'phone' : rows[0].phone,
                                'latitude' : rows[0].latitude,
                                'longitude' : rows[0].longitude,
                                'description' : rows[0].body
                            };
                            result.isOpened = isTimeBetween(rows[0].openingTime, rows[0].closingTime);
                            result.address = rows[0].street +", "+rows[0].city+"\nPIN-"+rows[0].pincode;
                            result.openingTime = moment(rows[0].openingTime, "hh:mm:ss").format("h:mm A");
                            result.closingTime = moment(rows[0].closingTime, "hh:mm:ss").format("h:mm A");                            
                            var response = {
                                'status' : 'success',
                                'result' : result
                            };
                            res.json(response);
                            console.log("Accessed Hotel Profile");
                        });
                    }
                    else{
                        var response = {
                            'status' : 'error',
                            'type' : [115]
                        };
                        res.json(response);
                    }
                });
            }
            else{
                res.json(check);
            }
        })
    });

    router.get('/search/suggestion', function(req, res){
        let token = req.query.token;
        let query = String(req.query.query);

        tokenVerify.verify(con, token, function(report){
            if(report.status == "success"){
                let sql = mysql.format("SELECT name, code, place FROM Hotel, Hotel_Profile WHERE hotelID = ID AND (MATCH(name) AGAINST (? IN NATURAL LANGUAGE MODE) OR SOUNDEX(name) = SOUNDEX(?) OR name LIKE ?)", [query, query, '%' + query + '%']);
                con.query(sql, function(err, rows){
                    if(err){
                        throw err;
                    }
                });
                con.query(sql, function(err, rows){
                    if(err){
                        throw err;
                    }
                    let response = {
                        "status" : "success",
                        "result" : rows
                    }
                    res.json(response);
                });
            }
            else{
                res.json(report);
            }
        });
    });

    function isTimeBetween(start, end){
        var now = moment();
        var a = moment(start, 'hh:mm:ss');
        var b = moment(end, 'hh:mm:ss');
        if(now.isBetween(a, b)){
            return true
        }
        else{
            return false;
        }
    }
    return router;
}