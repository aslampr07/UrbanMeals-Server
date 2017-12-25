var express = require('express');

var app = express();

app.get('/', function(req, res){
    res.send("Working fine");
})

app.listen(8000);