
"use strict";

var express = require('express');
var mysql = require('mysql');

module.exports = function (con) {
    var router = express.Router();

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
                    var sql = mysql.format("SELECT name, min(p.amount) as price FROM Item i, Price p WHERE itemID = i.ID and i.hotelId = ? GROUP BY itemID", [rows[0].ID]);
                    con.query(sql, function(err, result){
                        if(err){
                            throw err;
                        }
                        var respone = {
                            'status' : 'success',
                            'result' : result
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
        else if(categoryID > 1){
            var sql = mysql.format("SELECT * FROM Hotel WHERE code = ?", [hotelCode]);
            con.query(sql, function (err, rows) {
                if (err) {
                    throw err;
                }
                if (rows.length > 0) {
                    var sql = mysql.format("SELECT name, MIN(amount) as price FROM Item i, Price p WHERE i.ID in (SELECT cm.ItemID FROM Category_Map cm WHERE cm.CategoryID = ?) AND i.ID = p.itemID and i.hotelID = ? GROUP BY i.ID", [categoryID, rows[0].ID]);
                    con.query(sql, function(err, result){
                        if(err){
                            throw err;
                        }
                        var respone = {
                            'status' : 'success',
                            'result' : result
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

    return router;
}