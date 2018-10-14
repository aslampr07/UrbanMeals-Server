"use strict";
var express = require('express');
var con = require('./config/db');
var fileupload = require('express-fileupload')

var app = express();

app.use(express.urlencoded({extended:true}));
app.use(fileupload());

//Websites
app.use('/', express.static('public'));

//Routes
app.use('/api/1.0/restaurant', require('./routes/restaurant')(con));
app.use('/api/1.0/items', require('./routes/items')(con));
app.use('/api/1.0/account', require('./routes/account')(con));
app.use('/api/1.0/profile', require('./routes/profile')(con));

//New versioning system.
app.use('/api/restaurant', require("./routes/v1.1/restaurant")(con));
app.use('/api/admin', require("./routes/v1.1/admin")(con));

//app.use('/api/1.0/survey', require('./routes/survey')(con));
app.listen(8000);