
"use strict";

var express = require('express');
var mysql = require('mysql');
var hashids = require("hashids");
var jimp = require("jimp");
var tokenVerify = require("../tools/verification");


module.exports = function (con) {
    var router = express.Router();
    var hash = new hashids("items@urbanmeals", 11);
    var imagehash = new hashids("images@urbanmeals", 11, "abcdefghijklmnopqrstuvwxyz1234567890_-")

    //To get the categories that displays below the Digital Menu.
    router.get("/digitalmenu/categories", function (req, res) {
        var hotelCode = req.query.hotelcode;

        var sql = mysql.format("SELECT * FROM Hotel WHERE code = ?", [hotelCode]);
        con.query(sql, function (err, rows) {
            if (err) {
                throw err;
            }
            if (rows.length > 0) {
                var sql = mysql.format("SELECT ID, name, image as imageURL from Menu_Categories, Category " +
                    "WHERE hotelID =" +
                    "(SELECT ID FROM Hotel WHERE code = ? ) AND categoryID = ID", [hotelCode]);
                con.query(sql, function (err, rows) {
                    if (err) {
                        throw err;
                    }
                    //Push the 'All' category to starting of the array.
                    rows.unshift({ 'ID': 1, 'name': 'All', 'imageURL': '/assets/categoryimages/default.png' });
                    var response = {
                        'status': 'success',
                        'result': rows
                    }
                    res.send(response);
                });
            }
            else {
                var respone = {
                    'status': 'error',
                    'type': [115]
                }
                res.send(respone);
            }
        });
    });

    //To get all the items of a single menu category to display in digital menu.
    router.get("/get", function (req, res) {
        var categoryID = req.query.categoryid;
        var hotelCode = req.query.hotelcode;
        var token = req.query.token;

        if (categoryID == 1) {
            var sql = mysql.format("SELECT * FROM Hotel WHERE code = ?", [hotelCode]);
            con.query(sql, function (err, rows) {
                if (err) {
                    throw err;
                }
                if (rows.length > 0) {
                    var sql = mysql.format("SELECT name, code, min(p.amount) as price FROM Item i, Price p WHERE itemID = i.ID and i.hotelId = ? GROUP BY itemID", [rows[0].ID]);
                    con.query(sql, function (err, result) {
                        if (err) {
                            throw err;
                        }
                        var respone = {
                            'status': 'success',
                            'result': result
                        };
                        res.json(respone);
                    });
                }
                else {
                    var respone = {
                        'status': 'error',
                        'type': [115]
                    }
                    res.json(respone);
                }
            });
        }
        else if (categoryID > 1) {
            var sql = mysql.format("SELECT * FROM Hotel WHERE code = ?", [hotelCode]);
            con.query(sql, function (err, rows) {
                if (err) {
                    throw err;
                }
                if (rows.length > 0) {
                    var sql = mysql.format("SELECT name, code, MIN(amount) as price FROM Item i, Price p WHERE i.ID in (SELECT cm.ItemID FROM Category_Map cm WHERE cm.CategoryID = ?) AND i.ID = p.itemID and i.hotelID = ? GROUP BY i.ID", [categoryID, rows[0].ID]);
                    con.query(sql, function (err, result) {
                        if (err) {
                            throw err;
                        }
                        var respone = {
                            'status': 'success',
                            'result': result
                        };
                        res.json(respone);
                    });
                }
                else {
                    var respone = {
                        'status': 'error',
                        'type': [115]
                    }
                    res.json(respone);
                }
            });
        }
    });

    //To get information about a specific meal. (Meal Profile)
    router.get("/meal", function (req, res) {
        var token = String(req.query.token);
        var itemCode = String(req.query.itemcode);
        var itemid = hash.decode(itemCode)[0]

        tokenVerify.verify(con, token, function (report) {
            if (report.status == 'success') {
                var sql = mysql.format("SELECT i.code, i.name, h.name AS hotel, p.amount, p.description FROM Price p, Hotel h, Item i WHERE h.ID = hotelID AND i.ID = itemID AND i.ID = ?", [itemid]);
                con.query(sql, function (err, rows) {
                    if (err) {
                        throw err;
                    }
                    if (rows.length > 0) {
                        //Converting the flat data to meaningfull data.
                        var result = {};
                        result.code = rows[0].code;
                        result.name = rows[0].name;
                        result.hotel = rows[0].hotel;
                        result.price = []
                        for (var i = 0; i < rows.length; i++) {
                            var price = {
                                'amount': rows[i].amount,
                                'description': rows[i].description
                            }
                            result.price.push(price);
                        }
                        //^^Tha flat data conversation has been completed.
                        var response = {
                            'status': 'success',
                            'result': result
                        };
                        res.json(response);
                    }
                    else {
                        var response = {
                            'status': 'error',
                            'type': [116]
                        }
                        res.json(response);
                    }
                });
            }
            else {
                res.json(report)
            }
        })

    });


    router.post("/rate", function (req, res) {
        var token = String(req.query.token);
        var itemCode = String(req.body.itemcode);

        var taste = Number(req.body.taste);
        var presentation = Number(req.body.presentation);
        var quantity = Number(req.body.quantity);
        var body = String(req.body.body);

        tokenVerify.verify(con, token, function (report) {
            if (report.status == 'success') {
                var userID = report.id;
                var itemID = hash.decode(itemCode)[0];
                var data = {
                    "userID": userID,
                    "itemID": itemID,
                    "taste": taste,
                    "presentation": presentation,
                    "quantity": quantity,
                    "creationTime": new Date()
                };
                var sql = mysql.format("INSERT INTO Item_Rating SET ? ON DUPLICATE KEY UPDATE taste = ?, presentation = ?, quantity = ?, creationTime = ?", [data, taste, presentation, quantity, new Date()]);
                con.query(sql, function (err, rows) {
                    if (err) {
                        throw err;
                    }
                    var ratingID = rows.insertId;
                    if (body) {
                        var sql = mysql.format("INSERT INTO Item_Review VALUES(? , ?) ON DUPLICATE KEY UPDATE body = ?", [ratingID, body, body]);
                        con.query(sql, function (err, rows) {
                            if (err) {
                                throw err;
                            }
                            else {
                                var respone = {
                                    "status": "success"
                                }
                                res.json(respone);
                            }
                        });
                    }
                })
            }
            else {
                res.send(report);
            }
        });
    });

    router.get("/rating", function (req, res) {
        var token = String(req.query.token);
        var itemCode = String(req.query.itemcode);

        tokenVerify.verify(con, token, function (report) {
            if (report.status == "success") {
                var itemID = hash.decode(itemCode)[0];
                var sql = mysql.format("SELECT * from Item where ID = ?", [itemID]);
                con.query(sql, function (err, rows) {
                    if (rows.length > 0) {
                        var sql = mysql.format("SELECT AVG(taste) AS taste, AVG(presentation) AS presentation, AVG(quantity) AS quantity FROM Item_Rating WHERE itemID = ?", [itemID]);
                        con.query(sql, function (err, rows) {
                            var response = {
                                "status": "success",
                                "taste": (rows[0].taste == null) ? 0.0 : rows[0].taste,
                                "presentation": (rows[0].presentation == null) ? 0.0 : rows[0].presentation,
                                "quantity": (rows[0].quantity == null) ? 0.0 : rows[0].quantity
                            };
                            res.json(response);
                        });
                    }
                    else {
                        var response = {
                            "status": "error",
                            "type": [116]
                        };
                        res.send(response)
                    }
                });
            }
            else {
                res.json(report)
            }
        });
    });

    router.post("/photo/upload", function (req, res) {
        var token = req.query.token;
        var itemcode = req.query.itemcode;
        var pic = req.files.image;

        tokenVerify.verify(con, token, function (report) {
            if (report.status == "success") {
                var userID = report.id;
                var itemID = hash.decode(itemcode)[0];
                var sql = mysql.format("SELECT * FROM Item WHERE ID = ?", [itemID]);
                con.query(sql, function (err, rows) {
                    if (rows.length > 0) {
                        if (!pic) {
                            let reponse = {
                                "status": "error",
                                "type": [118]
                            }
                            res.json(response);
                        }
                        else {
                            if (pic.mimetype == "image/png" || pic.mimetype == "image/jpeg" || pic.mimetype == "image/jpg") {
                                //if (true) {

                                var buffer = pic.data;
                                jimp.read(buffer, function (err, img) {
                                    if (err)
                                        throw err;

                                    var filename = String(Math.floor(100000000000 + Math.random() * 900000000000)) + Math.floor(100000000000 + Math.random() * 900000000000);
                                    var height = img.bitmap.height;
                                    var width = img.bitmap.width;
                                    //When height or width exceeds 2048.
                                    if (height > 2048 || width > 2048) {
                                        //When height greater than width
                                        if (height > width) {
                                            height = 2048;
                                            width = jimp.AUTO;
                                        }
                                        else {
                                            width = 2048
                                            height = jimp.AUTO;
                                        }
                                    }
                                    img = img.resize(width, height).quality(70);
                                    img.write(`public/assets/items/${filename}.jpg`, function () {
                                        //Creating The thumbnail.
                                        //SET the thumbnail size
                                        var THUMBNAIL_SIZE = 161;
                                        var thumpHeight = img.bitmap.height;
                                        var thumpWidth = img.bitmap.width;
                                        var thumbnail, x, y;
                                        //To find the crop location of the thumbnail.
                                        //Initially the thumbnail is resized without changing the ascept ratio.
                                        //Then the image is cropped to square with size from THUMBNAIL_SIZE
                                        if (thumpHeight < thumpWidth) {
                                            thumpHeight = THUMBNAIL_SIZE;
                                            thumpWidth = jimp.AUTO;
                                            thumbnail = img.resize(thumpWidth, thumpHeight).quality(50);
                                            thumpHeight = thumbnail.bitmap.height;
                                            thumpWidth = thumbnail.bitmap.width;
                                            x = (thumpWidth / 2) - (THUMBNAIL_SIZE / 2);
                                            y = 0;
                                        }
                                        else {
                                            thumpWidth = THUMBNAIL_SIZE;
                                            thumpHeight = jimp.AUTO;
                                            thumbnail = img.resize(thumpWidth, thumpHeight).quality(50);
                                            thumpHeight = thumbnail.bitmap.height;
                                            thumpWidth = thumbnail.bitmap.width;
                                            x = 0;
                                            y = (thumpHeight / 2) - (THUMBNAIL_SIZE / 2)
                                        }
                                        //Final Cropping and writing of the image.
                                        thumbnail.crop(x, y, THUMBNAIL_SIZE, THUMBNAIL_SIZE)
                                            .write(`public/assets/items/${filename}_thumb.jpg`, function () {
                                                con.beginTransaction(function (err) {
                                                    if (err) {
                                                        throw err;
                                                    }
                                                    var data = {
                                                        "userID": userID,
                                                        "itemID": itemID,
                                                        "imageURL": `/assets/items/${filename}.jpg`,
                                                        "thumbnailURL" : `/assets/items/${filename}_thumb.jpg`,
                                                        "creationTime": new Date()
                                                    }
                                                    var sql = mysql.format("INSERT INTO Item_Pictures SET ?", data)
                                                    con.query(sql, function (err, rows) {
                                                        if (err) {
                                                            return con.rollback(function () {
                                                                throw err;
                                                            })
                                                        }
                                                        var imageID = rows.insertId;
                                                        var imageCode = imagehash.encode(imageID);
                                                        var sql = mysql.format("UPDATE Item_Pictures SET code = ? WHERE ID = ?", [imageCode, imageID]);
                                                        con.query(sql, function (err) {
                                                            if (err) {
                                                                return con.rollback(function () {
                                                                    throw err;
                                                                });
                                                            }
                                                            con.commit(function (err) {
                                                                if (err) {
                                                                    con.rollback(function () {
                                                                        throw err;
                                                                    })
                                                                }
                                                                var response = {
                                                                    "status": "success",
                                                                    "imageID": imageCode
                                                                }
                                                                res.json(response);
                                                            })
                                                        })
                                                    })
                                                });

                                            });

                                    });
                                });
                            }
                            else {
                                //Uploaded file is not an image.
                                var response = {
                                    'status': 'error',
                                    'type': [117]
                                }
                                res.json(response);
                            }
                        }
                    }
                    else {
                        var response = {
                            'status': "error",
                            "type": [116]
                        };
                        res.json(response);
                    }
                });


            }
            else {
                res.json(report);
            }

        });

    });

    router.get("/thumbnails", function(req, res){
        var token = String(req.query.token);
        var itemCode = String(req.query.itemcode)
        tokenVerify.verify(con, token, function(report){
            if(report.status == "success"){
                var itemID = hash.decode(itemCode)[0];
                var sql = mysql.format("SELECT * FROM Item where ID = ?", [itemID]);
                con.query(sql, function(err, rows){
                    if(err){
                        throw err;
                    }
                    if(rows.length > 0){
                        let sql = mysql.format("SELECT code, thumbnailURL as url FROM Item_Pictures WHERE itemID = ?",[itemID]);
                        con.query(sql, function(err, rows){
                            if(err){
                                throw err;
                            }
                            let response = {
                                "status" : "success",
                                "result" : rows
                            }
                            res.send(response);
                        })
                    }
                    else{
                        let response = {
                            "status" : "error",
                            "type" : [116]
                        }
                        res.json(response);
                    }
                });
            }
            else{
                res.json(report);
            }
        });
    });

    router.get("/reviews/:who", function(req, res){
        var who = req.params.who;
        var token = req.query.token;
        var itemCode = req.query.itemcode;

        tokenVerify.verify(con, token, function(report){
            if(report.status == "success"){
                let itemID = hash.decode(itemCode)[0];
                let sql = mysql.format("SELECT * FROM Item WHERE ID = ?", [itemID]);
                con.query(sql, function(err, rows){
                    if(err){
                        throw err;
                    }
                    if(rows.length > 0){
                        let blogger;
                        if(who == "user"){
                            blogger = 'N';
                        }
                        if(who == "critic"){
                            blogger = 'Y';
                        }
                        let sql = mysql.format("SELECT firstName as firstname, lastName as lastname, taste, presentation, quantity, body "
                                                    +"FROM Item_Review re, Item_Rating ra, User u, User_Profile up "
                                                    +"WHERE re.ratingID = ra.ID AND ra.userID = u.ID AND u.ID = up.userID AND ra.itemID = ? "
                                                    +"AND u.blogger = ? ORDER BY ra.creationTime DESC", [itemID, blogger]);
                        con.query(sql, function(err, rows){
                            if(err){
                                throw err;
                            }
                            let response = {
                                "status" : "success",
                                "result" : rows
                            }
                            res.json(response);
                        })
                    }
                    else{
                        let response = {
                            "status" : "error",
                            "type" : [116]
                        };
                        res.json(response);
                    }
                });
            }
            else{
                res.json(respone);
            }
        })
    })

    return router;
}