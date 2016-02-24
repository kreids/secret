/* Some initialization boilerplate. Also, we include the code from
   routes/routes.js, so we can have access to the routes. Note that
   we get back the object that is defined at the end of routes.js,
   and that we use the fields of that object (e.g., routes.get_main)
   to access the routes. */

var express = require('express');
var routes = require('./routes/routes.js');
var app = express();
var vogels = require('vogels');

//mongoshit
var mongo = require('mongodb');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/myDB', function(err) {
    if(err) {
        console.log('DB connection error', err);
    } else {
        console.log('Db connection successful');
    }
});


//mongoose.connect('mongodb://localhost/myDB');
//end mongoose


vogels.AWS.config.loadFromPath('./config.json');

app.use(express.bodyParser());
app.use(express.logger("default"));

app.use(express.cookieParser());
app.use(express.session({secret: '1234567890QWERTY'}));

//app.use('/', routes);


app.get('/', routes.get_login);
app.post('/authenticate', routes.check_pass);
app.post('/createaccount', routes.get_createaccount);
app.use(express.static('public'));
console.log('Author: Rohan Alur (ralur) & Don Yu (dyu) & Steve Kreider (kreids)');
app.listen(80);
console.log('Server running on port 80. Now open http://localhost:8080/ in your browser!');
