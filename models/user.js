var mongoose = require('mongoose');
var userSchema = new mongoose.Schema({
	name : String,
	email : String,
	password : String,
	day : Number,
	month : Number,
	year : Number,


/*
	var name = req.body.fullName;
	var email = req.body.email;
	var password = req.body.password1;
	var password2 = req.body.password2;
	var affiliation = req.body.affilation;
	var day = req.body.day;
	var month = req.body.month;
	var year = req.body.year;
	var hashedPassword = passwordHash.generate(password);*/
});

module.exports = mongoose.model('User',userSchema);