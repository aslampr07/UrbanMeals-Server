var express = require('express');

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

    router.get('/', function(req, res){
        
    });

    return router;
}