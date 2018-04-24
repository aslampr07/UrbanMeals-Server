"use strict";
var express = require('express');
var con = require('./config/db');
var request = require('request');

var app = express();

app.use(express.urlencoded({extended:true}));

//Websites
app.use('/', express.static('public'));
app.use('/kochinfoodie', express.static('public/kochinfoodie'));
app.use('/calicutfood', express.static('public/calicut'));
app.use('/bitemeup', express.static('public/bitemeup'));
app.use('/hungrykochite', express.static('public/hungrykochite'));
app.use('/annafoodieandherfeast', express.static('public/foodieandherfeast'));
//  app.use(express.static('public/foodinmylens'));

//removed the register and signup page.
//app.use('/register', express.static('public/register'));
//app.use('/survey', express.static('public/survey'));

//Routes
app.use('/api/1.0/restaurant', require('./routes/restaurant')(con));
app.use('/api/1.0/items', require('./routes/items')(con));
app.use('/api/1.0/account', require('./routes/account')(con));

var url = `http://sapteleservices.com/SMS_API/sendsms.php?username=URBAN07&password=urban@meals&mobile=+918089709076&sendername=UMTEAM&message=${1234}+is+your+phone+verification+pin.+Welcome+to+Urban+Meals.&routetype=1`;
request.get(url, function(err, response, body){
    console.log(body);
});


//app.use('/api/1.0/survey', require('./routes/survey')(con));
app.listen(8000);