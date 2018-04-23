
"use strict";

var express = require('express');
var mysql = require('mysql');
var hashids = require("hashids");
var tokenVerify = require("../tools/verification");


module.exports = function (con) {
    var router = express.Router();
    var hash = new hashids("items@urbanmeals", 11);

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

    //To get information about a specific meal.
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
                        console.log(sql);
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
                            "status" : "error",
                            "type" : [116]
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
    return router;
}