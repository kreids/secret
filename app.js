/* Some initialization boilerplate. Also, we include the code from
   routes/routes.js, so we can have access to the routes. Note that
   we get back the object that is defined at the end of routes.js,
   and that we use the fields of that object (e.g., routes.get_main)
   to access the routes. */

var express = require('express');
var routes = require('./routes/routes.js');
var app = express();
var vogels = require('vogels');
var mongoose = require('mongoose');

mongoose.connect('104.236.195.8:27017');

vogels.AWS.config.loadFromPath('./config.json');

app.use(express.bodyParser());
app.use(express.logger("default"));

app.use(express.cookieParser());
app.use(express.session({secret: '1234567890QWERTY'}));

app.get('/', routes.get_login);
app.post('/authenticate', routes.check_pass);
app.post('/createaccount', routes.get_createaccount);
app.use(express.static('public'));
console.log('Author: Rohan Alur (ralur) & Don Yu (dyu) & Steke Kreider (kreids)');
app.listen(80);
console.log('Server running on port 80. Now open http://localhost:8080/ in your browser!');
