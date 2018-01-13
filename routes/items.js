
"use strict";

var express = require('express');
var mysql = require('mysql');

module.exports = function(con){
    var router = express.Router();
    
    //For getting the all list of categories along with there IDs
    router.get('/categories', function(req, res){
        var sql = 'SELECT * FROM Category';
        con.query(sql, function(err, result){
            if(err)
            var response = {
                'status':'success',
                'result':result
            };
            res.send(result);
        });
    });

    router.get('/find', function(req, res){
        var hotelCode = req.query.hotelCode;

        var sql = mysql.format('SELECT ID FROM Hotel WHERE code = ?', [hotelCode]);
        con.query(sql, function(err, result){
            if(err)
            {
                throw err;
            }
            if(result.length){
                var hotelId = result[0].ID;
                
                var sql = mysql.format('SELECT i.ID, i.name, cm.categoryID AS category, p.ID AS priceID, p.amount, p.description '+
                'from Item i, Category_Map cm, Price p'+
                ' WHERE p.itemID = i.ID AND cm.itemID = i.ID AND i.hotelID = ? ORDER BY i.ID', [hotelId]);
                console.log(sql);
                con.query(sql, function(err, result){
                    if(err){
                        throw err;
                    }

                    var response = [];
                    for(var i in result){
                        var index = CheckIdExist(response, result[i].ID);
                        if(index == -1) {
                            var insertData = {
                                'ID':result[i].ID,
                                'name':result[i].name,
                                'category':[result[i].category],
                                'price':[{
                                    'ID':result[i].priceID,
                                    'amount':result[i].amount,
                                    'description':result[i].description
                                }]
                            };
                        response.push(insertData);
                       }
                       else{
                            if(CheckCategoryExist(response[index].category, result[i].category) == -1){
                                response[index].category.push(result[i].category);
                            }
                            
                            if(CheckPriceExist(response[index].price, result[i].priceID) == -1){
                                var price = {
                                    'ID':result[i].priceID,
                                    'amount':result[i].amount,
                                    'description':result[i].description
                                };
                                response[index].price.push(price);
                            }
                       }
                    }
                    res.send(response);
                });
                
            }
            else
                res.send("The hotelCode is invalid");
        });
    });

    function CheckIdExist(itemList, itemId){
        for(var i in itemList){
            if(itemList[i].ID == itemId)
                return i;
        }
        return -1;
    }

    function CheckCategoryExist(categories, catId){
        for(var i in categories){
            if(categories[i] == catId)
                return i;
        }
        return -1;
    }

    function CheckPriceExist(prices, priceId){
        for(var i in prices){
            if(prices[i].ID == priceId)
                return i;
        }
        return -1;
    }
    
    return router;
}