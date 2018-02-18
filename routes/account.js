"use strict";
var express = require('express');
var mysql = require('mysql');
var validator = require('validator');
var Hashid = require('hashids');
var bcrypt = require('bcrypt');
var crypto = require('crypto');

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
        //The Query string values.
        var firstName = String(req.body.firstname).trim();
        var lastName = String(req.body.lastname).trim();
        var email = String(req.body.email).trim();
        var phone = String(req.body.phone).trim();
        var password = String(req.body.password);

        validateRegisterForm(firstName, lastName, email, phone, password, function (response) {
            if (response.status == 'success') {
                con.beginTransaction(function (err) {
                    if (err) {
                        throw err;
                    }
                    var sql = mysql.format("INSERT INTO User(creationTime) VALUES(NOW())");
                    con.query(sql, function (err, result) {
                        if (err) {
                            return con.rollback(function () {
                                throw err;
                            });
                        }
                        var userId = result.insertId;
                        var data = {
                            'userID': userId,
                            'firstName': firstName,
                            'lastName': lastName,
                            'email': email,
                            'phone': phone
                        };
                        var sql = mysql.format("INSERT INTO User_Profile SET ?");
                        con.query(sql, data, function (err, result) {
                            if (err) {
                                return con.rollback(function () {
                                    throw err;
                                });
                            }
                            bcrypt.hash(password, 10, function (err, hash) {
                                if (err) {
                                    return con.rollback(function () {
                                        throw err;
                                    });
                                }
                                var sql = mysql.format('INSERT INTO User_Password VALUES(?, ?)', [userId, String(hash)]);
                                con.query(sql, function (err, result) {
                                    if (err) {
                                        return con.rollback(function () {
                                            throw err;
                                        });
                                    }
                                    var token = crypto.randomBytes(16).toString('HEX')
                                    var data = {
                                        'userID': userId,
                                        'token': token,
                                        'pin': Math.floor(1000 + Math.random() * 9000),
                                        'creationTime': new Date()
                                    }
                                    con.query('INSERT INTO SMS_OTP SET ?', data, function (err, result) {
                                        if (err) {
                                            con.rollback(function () {
                                                throw err;
                                            });
                                        }

                                        con.commit(function (err) {
                                            if (err) {
                                                return con.rollback(function () {
                                                    throw err;
                                                });
                                            }
                                            delete response.type;
                                            response.token = token;
                                            res.send(response);
                                            //Completed the commit.
                                        });
                                        //Inserted OTP into the database  
                                    });
                                    //Inserted the password.
                                });
                                //Password is hashed and salted.
                            });
                            //Inserted the profile items to User_Profile table.
                        });
                        //Registered the User into User table.
                    });
                    //Transaction has beginned.    
                });
            }
            else {
                res.send(response);
            }
            //The form has been validated.
        });
    });


    //Verfying the SMS OTP.
    router.post('/verify/phone', function (req, res) {
        var token = req.body.token;
        var otp = parseInt(req.body.otp);

        var sql = mysql.format("SELECT TIMESTAMPDIFF(MINUTE, creationTime, NOW()) as time, userID, pin from SMS_OTP WHERE token = ?", [token]);
        con.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            console.log("Hello");
            if (result.length > 0) {
                if (result[0].time > 10) {
                    var response = {
                        'status': 'error',
                        'type': [109]
                    }
                    res.send(response);
                }
                else {
                    if (result[0].pin == otp) {
                        var response = {
                            'status': 'success'
                        }
                        var sql = mysql.format("UPDATE User SET phoneVerified = 'Y' WHERE ID = ?", [result[0].userID]);
                        con.query(sql, function (err) {
                            if (err) {
                                throw err;
                            }
                            res.send(response);
                        });
                    }
                    else {
                        var response = {
                            'status': 'success',
                            'type': [110]
                        };
                        res.send(response);
                    }
                }
            }
            else {
                var response = {
                    'status': 'error',
                    'type': [108]
                };
                res.send(response);
            }
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
                        else {
                            cb(response);
                        }
                    });
                }
                else {
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