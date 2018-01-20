"use strict";
var express = require('express');
var con = require('./config/db');

var app = express();

app.use(express.urlencoded({extended:true}));

//Routes
app.use('/api/1.0/restaurant', require('./routes/restaurant')(con));
app.use('/api/1.0/items', require('./routes/items')(con));
app.use('/api/1.0/account', require('./routes/account')(con));

app.listen(8000);