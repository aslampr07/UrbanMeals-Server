"use strict";

var express = require('express');
var mysql = require('mysql');
var validator = require('validator');
var Hashid = require('hashids');


module.exports = function (con) {
    var router = express.Router();

    router.post('/register', function (req, res) {
        var name = req.body.name;
        var email = req.body.email;
        var phone = req.body.phone;

        var id = new Hashid("Launching Soon", 5);

        if (validator.isEmail(email)) {
            var sql = mysql.format('SELECT * FROM WebUser WHERE email = ?', [email]);
            con.query(sql, function (err, result) {
                if (err) {
                    throw err;
                }
                if (result.length > 0) {
                    var response = {
                        'status' : 'error',
                        'type': 'emailAlreadyExist'
                    };
                    res.send(response);
                }
                else {
                    var random = parseInt(Math.random() * 100000);
                    var voucher = id.encode(random);
                    var data = {
                        'name' : name,
                        'email' : email,
                        'phone' : phone, 
                        'voucher': voucher,
                        'creationTime' : new Date()
                    };
                    var sql = mysql.format('INSERT INTO WebUser SET ?', [data]);
                    con.query(sql, function (err, result) {
                        if (err) {
                            throw err;
                        }
                        var response = {
                            'status': 'success',
                        }
                        res.send(response);
                    });
                }

            });
        }
        else {
            var response = {
                'status': 'error',
                'type': 'EmailNotValid'
            };
            res.send(response);
        }
    });
    return router;
}

