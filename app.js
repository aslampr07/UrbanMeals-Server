var express = require('express');
var con = require('./config/db');

var app = express();

app.use(express.urlencoded({extended:true}));

app.use('/api/1.0/restaurant', require('./routes/restaurant')(con));

app.listen(8000);