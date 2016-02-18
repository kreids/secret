/* Some initialization boilerplate. Also, we include the code from
   routes/routes.js, so we can have access to the routes. Note that
   we get back the object that is defined at the end of routes.js,
   and that we use the fields of that object (e.g., routes.get_main)
   to access the routes. */

var express = require('express');
var routes = require('./routes/routes.js');
var app = express();
var vogels = require('vogels');

vogels.AWS.config.loadFromPath('./config.json');

app.use(express.bodyParser());
app.use(express.logger("default"));

app.use(express.cookieParser());
app.use(express.session({secret: '1234567890QWERTY'}));

app.get('/', routes.get_login);
app.post('/authenticate', routes.check_pass);
app.post('/createaccount', routes.get_createaccount);
app.get('/logout', routes.logout);
app.get('/profile', routes.get_profile);
app.post('/getWall', routes.get_Wall);
app.get('/getFriendSuggestions', routes.get_Friend_Suggestions);
app.post('/addPost', routes.addPost);
app.get('/feed', routes.getFeed);
app.post('/getFeedPosts', routes.getFeedPosts);
app.post('/createFriendship', routes.createFriendship);
app.post('/deleteFriendship', routes.deleteFriendship);
app.post('/search', routes.userLookup);
app.post('/removeFriendFromList', routes.removeFriendFromList);
app.post('/addComment', routes.addComment);
app.get('/getFriends/:user', routes.getFriends);
app.get('/friendvisualization', routes.friendVisualization);
app.get('/visualizer', routes.renderVisualizer);
app.get('/recommendations', routes.getFriendRecs);
app.use(express.static('public'));
console.log('Author: Rohan Alur (ralur) & Don Yu (dyu)');
app.listen(80);
console.log('Server running on port 80. Now open http://localhost:8080/ in your browser!');
