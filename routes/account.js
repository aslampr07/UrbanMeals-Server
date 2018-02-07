"use strict";
var express = require('express');
var mysql = require('mysql');
var validator = require('validator');
var Hashid = require('hashids');

module.exports = function (con) {
    var router = express.Router();
    /*
        router.post('/register', function (req, res) {
            var name = req.body.name;
            var email = req.body.email;
            var phone = req.body.phone;
    
            var id = new Hashid("Launching Soon", 5);
    
            if (true) {
                var sql = mysql.format('SELECT * FROM WebUser WHERE email = ?', [email]);
                con.query(sql, function (err, result) {
                    if (err) {
                        console.log(err);
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
                                console.log(err)
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
    
        */

    router.post('/register', function (req, res) {
        var firstName = String(req.body.firstname).trim();
        var lastName = String(req.body.lastname).trim();
        var email = String(req.body.email).trim();
        var phone = String(req.body.phone).trim();
        var password = String(req.body.password);
        validateRegisterForm(firstName, lastName, email, phone, password, function(response){
            res.send(response);
        });
    });

    function validateRegisterForm(firstName, lastName, email, phone, password, cb) {
        var response = {
            'status': 'success',
            'type': []
        }

        if (password.length < 7) {
            response.status = 'error',
            response.type.push(103);
        }
        //Check if the firstname and lastname has alphabets only.
        if (!/^[A-z]+$/.test(firstName)) {
            response.status = 'error',
            response.type.push(104);
        }
        if (!/^[A-z]+$/.test(lastName)) {
            response.status = 'error',
            response.type.push(105);
        }
        if (/^\+91\d{10}$/.test(phone)) {
            var sql = mysql.format("SELECT * FROM User_Profile WHERE phone = ?", [phone]);
            con.query(sql, function (err, result) {
                if (result.length > 0) {
                    response.status = 'error';
                    response.type.push(101);
                }
                if (validator.isEmail(email)) {
                    var sql = mysql.format("SELECT * FROM User_Profile WHERE email = ?", [email]);
                    con.query(sql, function (err, result) {
                        if (result.length > 0) {
                            response.status = 'error';
                            response.type.push(106); 
                            cb(response);
                        }
                        else{
                           cb(response); 
                        }
                    });
                }
                else{
                    response.status = 'error';
                    response.type.push(107);
                    cb(response);
                }
            });
        }
        else {
            response.status = 'error';
            response.type.push(102);
            cb(response);
        }
    }

    return router;
}

