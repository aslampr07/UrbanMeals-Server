
"use strict";

var express = require('express');
var mysql = require('mysql');
var hashids = require("hashids");
var jimp = require("jimp");
var tokenVerify = require("../tools/verification");


module.exports = function (con) {
    var router = express.Router();
    var hash = new hashids("items@urbanmeals", 11);
    var imagehash = new hashids("images@urbanmeals", 11, "abcdefghijklmnopqrstuvwxyz1234567890_-");
    var categoryHash = new hashids("categories@urbanmeals", 11);

    //To get the categories that displays below the Digital Menu.
    router.get("/digitalmenu/categories", function (req, res) {
        var hotelCode = req.query.hotelcode;
        let token = req.query.token;

        var sql = mysql.format("SELECT ID FROM Hotel WHERE code = ?", [hotelCode]);
        con.query(sql, function (err, rows) {
            if (err) {
                throw err;
            }
            if (rows.length > 0) {
                let hotelID = rows[0].ID;
                var sql = mysql.format("SELECT name, image as imageURL, code from Menu_Categories, Category " +
                    "WHERE hotelID = ? AND categoryID = ID", [hotelID]);
                con.query(sql, function (err, rows) {
                    if (err) {
                        throw err;
                    }
                    //Push the 'All' category to starting of the array.
                    rows.unshift({ 'name': 'All', 'imageURL': '/assets/categoryimages/all.png', 'code' : 'abcdef1234' });
                    var response = {
                        'status': 'success',
                        'result': rows
                    }
                    res.json(response);
                    console.log("Accessed Digital Menu");
                });
            }
            else {
                var response = {
                    'status': 'error',
                    'type': [115]
                }
                res.json(response);
            }
        });
    });

    //To get all the items of a single menu category to display in digital menu.
    router.get("/menu", function (req, res) {
        let categoryCode = req.query.catcode;
        var hotelCode = req.query.hotelcode;
        var token = req.query.token;

        if (categoryCode === "abcdef1234") {
            var sql = mysql.format("SELECT ID FROM Hotel WHERE code = ?", [hotelCode]);
            con.query(sql, function (err, rows) {
                if (err) {
                    throw err;
                }
                if (rows.length > 0) {
                    var sql = mysql.format("SELECT name, code, min(p.amount) as price, (SELECT avg((taste+presentation+quantity)/3) FROM Item_Rating WHERE itemID = i.ID) as rating FROM Item i, Price p WHERE itemID = i.ID and i.hotelId = ? GROUP BY itemID", [rows[0].ID]);
                    con.query(sql, function (err, result) {
                        if (err) {
                            throw err;
                        }
                        for(let i in result){
                            result[i].rating = (result[i].rating == null) ? 0.0 : result[i].rating;
                        }
                        let response = {
                            'status': 'success',
                            'result': result
                        };
                        res.json(response);
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
        else {
            var sql = mysql.format("SELECT * FROM Hotel WHERE code = ?", [hotelCode]);
            con.query(sql, function (err, rows) {
                if (err) {
                    throw err;
                }
                if (rows.length > 0) {
                    let categoryID = categoryHash.decode(categoryCode)[0];
                    var sql = mysql.format("SELECT name, code, MIN(amount) as price, (SELECT avg((taste+presentation+quantity)/3) FROM Item_Rating WHERE itemID = i.ID) as rating FROM Item i, Price p WHERE i.ID in (SELECT cm.ItemID FROM Category_Map cm WHERE cm.CategoryID = ?) AND i.ID = p.itemID and i.hotelID = ? GROUP BY i.ID", [categoryID, rows[0].ID]);
                    con.query(sql, function (err, result) {
                        if (err) {
                            throw err;
                        }
                        for(let i in result){
                            result[i].rating = (result[i].rating == null) ? 0.0 : result[i].rating;
                        }
                        let response = {
                            'status': 'success',
                            'result': result
                        };
                        res.json(response);
                    });
                }
                else {
                    let respone = {
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
                        console.log("Accessed Meal Profile");
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


    //For posting the rating about an item.
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
                    else{
                        let response = {
                            "status" : "success"
                        }
                        res.json(response);
                    }
                })
            }
            else {
                res.send(report);
            }
        });
    });

    //To get the rating about an item.
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

    //To upload photo about an item.
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

    //This return the all the thumbnails about an item.
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

    //This return the reviews and rating about a specific meal, the 'who' = 'critc'|'user'
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
    });

    //This return the suggested meal in the nearby places.
    router.get("/suggestion" ,function(req, res){
        let token = String(req.query.token);
        let latitude = Number(req.query.lat);
        let longitude = Number(req.query.lon);

        tokenVerify.verify(con, token, function(report){
            if(report.status = "success"){
                let sql = mysql.format("SELECT p.ID, p.name AS place, i.name AS item, i.code, min(pr.amount) AS price, h.name AS hotel FROM Item_Suggestions s, Places p, Item i, Price pr, Hotel h WHERE placeID = p.ID AND s.itemID = i.ID AND pr.itemID = i.ID AND i.hotelID = h.ID GROUP BY s.itemID ORDER BY calculate_distance(p.latitude,p.longitude, ?, ?)", [latitude, longitude]);
                con.query(sql, function(err, rows){
                    let placeID = -1;
                    let mainItems = [];
                    for(let item in rows){
                        let singleItem = {};
                        singleItem.name = rows[item].item;
                        singleItem.code = rows[item].code;
                        singleItem.price = rows[item].price;
                        singleItem.hotel = rows[item].hotel;
                        if(placeID == rows[item].ID){
                            mainItem.item.push(singleItem);
                        }
                        else{
                            placeID = rows[item].ID;
                            var mainItem = {};
                            mainItem.place = rows[item].place;
                            mainItem.item = [singleItem]
                            mainItems.push(mainItem);
                        }
                    }
                    let response = {
                        "status" : "success",
                        "result" : mainItems
                    }
                    res.json(response);
                });
            }
            else{
                res.json(report);
            }
        });
    });

    return router;
}