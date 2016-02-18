	
var async = require('async');
var passwordHash = require('password-hash');

// get login screen
var getLogin = function(req, res) {
	console.log('Rohan Alur (ralur)');
	res.render('login.ejs', {
		user : null,
		message : null,
		result : null
	});
};

// create new user account
var createAccount = function(req, res) {
	var name = req.body.fullName;
	var email = req.body.email;
	var password = req.body.password1;
	var password2 = req.body.password2;
	var affiliation = req.body.affilation;
	var day = req.body.day;
	var month = req.body.month;
	var year = req.body.year;
	var hashedPassword = passwordHash.generate(password);

	db.addUser(email, name, hashedPassword, affiliation, "empty", month + "-" + day + "-" + year, function(error) {
		if (error) {
			log_out(req, res);
		}
		else {
			req.session.email = email;
			getFeed(req, res);
		}
	});

};

// ensure password matches username
var checkPass = function(req, res) {
	var email = req.body.email;
	var password = req.body.password;
	if (email && password) {
		db.getUserInfo(email, function(error, userInfo) {
			if (error || !userInfo) {
				res.send('the username and password you entered did not match our records', 200);
			}
			else {
				var dbHashedPassword = userInfo.hashedPassword;
				if (passwordHash.verify(password, dbHashedPassword)) {
					req.session.email = email;
					db.logIn(email, function(error, response) {
						if (error || !response) {
							res.send('error logging in', 200);
						}
						else {
							res.send(null, 200);
						}
					});
				}
				else {
					res.send('the username and password you entered did not match our records', 200);
				}
			}
		});
	}
	else {
		res.send('The email and password you entered did not match', 200);
	}
};

// looks up users for a given search query
var userLookup = function(req, res) {
	var name = req.body.search.toLowerCase();
	var suggestions = [];
	db.getFriendSugg(name, function(error, info) {
		if (error || !info) {
			getFeed(req, res);
		}
		else {
			info.forEach(function(item) {
				suggestions.push({name: item.name, email: item.email});
			});
		}
		res.render('search.ejs', {
			results: suggestions
		});
	});
};


		var routes = {
			check_pass : checkPass,
			get_login : getLogin,
			get_createaccount : createAccount,
			userLookup: userLookup,

		};

		module.exports = routes;
