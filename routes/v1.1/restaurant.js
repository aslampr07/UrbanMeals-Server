"use strict"
var express = require('express');
var mysql = require('mysql');
var moment = require('moment');

var tokenVerify = require("../../tools/verification")

module.exports = function (con) {
    var router = express.Router();

    router.get("/1.1/profile", function (req, res) {
        let token = req.query.token;
        let hotelCode = req.query.hotelcode;

        tokenVerify.verify(con, token, function (report) {
            if (report.status === "success") {
                let sql = mysql.format("SELECT ID from Hotel WHERE code = ?", [hotelCode]);
                con.query(sql, function (err, rows) {
                    if (rows.length > 0) {
                        let hotelID = rows[0].ID;
                        let sql = mysql.format("SELECT name, code, latitude, longitude, type, phone, street, place, city, pincode, body as description FROM Hotel, Hotel_Profile hp, Hotel_Description hd WHERE ID = ? AND hp.hotelID = ID AND hd.hotelID = ID", [hotelID]);
                        con.query(sql, function (err, rows) {
                            let result = rows[0];
                            let sql = mysql.format("SELECT dayOfWeek, timeStatus, startTime, endTime FROM Hotel_Timing WHERE hotelID = ?", [hotelID]);
                            con.query(sql, function (err, rows) {
                                if (err) {
                                    throw err;
                                }
                                let now = moment();
                                let index;
                                for (let i in rows) {
                                    //check if it is today.
                                    if (now.day() == rows[i].dayOfWeek) {
                                        index = i;
                                        break;
                                    }
                                }
                                let startTime = moment(rows[index].startTime, "hh:mm:ss");
                                let endTime = moment(rows[index].endTime, "hh:mm:ss");
                                let isBetween = now.isBetween(startTime, endTime);
                                if (rows[index].timeStatus == "C") {
                                    result.isOpened = !isBetween;
                                }
                                else if (rows[index].timeStatus == "O") {
                                    result.isOpened = isBetween;
                                }
                                let timing = [];
                                for (let i in rows) {
                                    if (rows[i].timeStatus == "O") {
                                        let start = moment(rows[i].startTime, "hh:mm:ss").format("hh:mm A");
                                        let end = moment(rows[i].endTime, "hh:mm:ss").format("hh:mm A");
                                        let str = `${start} - ${end}`;
                                        let time = {
                                            "day": rows[i].dayOfWeek,
                                            "interval": str
                                        };
                                        timing.push(time);
                                    }
                                    else if (rows[i].timeStatus == "C") {
                                        if (rows[i].startTime == "00:00:00" && rows[i].endTime == "23:59:59") {
                                            let time = {
                                                "day": rows[i].dayOfWeek,
                                                "interval": "Holiday"
                                            };
                                            timing.push(time);
                                        }
                                        else {
                                            let str = `12:00 AM - ${moment(rows[i].startTime, "hh:mm:ss").format("hh:mm A")}, ${moment(rows[i].endTime, "hh:mm:ss").format("hh:mm A")} - 11:59 PM`;
                                            let time = {
                                                "day": rows[i].dayOfWeek,
                                                "interval": str
                                            };
                                            timing.push(time);
                                        }
                                    }
                                }
                                result.timing = timing;
                                res.json(result);
                            });
                        });
                    }
                    else {
                        let response = {
                            "status": "error",
                            "type": [115]
                        };
                        res.json(response);
                    }
                });
            }
            else {
                res.send(report)
            }
        });
    });


    router.get("/1.1/promotion/banner", function (req, res) {
        let token = req.query.token;

        tokenVerify.verify(con, token, function (report){
            if(report.status == "success"){
                let sql = "SELECT code, bannerURL, name FROM Hotel, Hotel_Promotion_Banner WHERE hotelID = ID";
                con.query(sql, function (err, rows) {
                    if (err) {
                        throw err;
                    }
                    let response = {
                        "status" : "success",
                        "result" : rows
                    };
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