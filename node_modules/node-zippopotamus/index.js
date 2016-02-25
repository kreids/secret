'use strict';
var http = require('http');

var CLI_EXEC = (require.main === module),
	DEFAULT_COUNTRY = 'us';

var zippopotamus = module.exports = function (country, zip, cb) {
	if (arguments.length === 2) {
		cb = zip;
		zip = country;
		country = DEFAULT_COUNTRY;
	}

	var url = 'http://www.zippopotam.us/%s/%s'
		.replace('%s', country)
		.replace('%s', zip);

	http.get(url, function (res) {
		var resData = [];
		res.setEncoding('utf8');
		res.on('data', resData.push.bind(resData));
		res.on('end', function () {
			var err, json, data = resData.join('');
			if (res.statusCode !== 200) {
				err = new Error('bad response');
				err.statusCode = res.statusCode;
				err.data = data;
				return cb(err);
			}
			try {
				json = JSON.parse(data);
			} catch (ex) {
				err = ex;
			}
			cb(err, json);
		});
	}).on('error', function (err) {
		cb(err);
	});
};

if (CLI_EXEC) {
	if (process.argv.length === 2) {
		console.info('usage: node zippopotamus.js [country] [zip]');
		console.info('usage: node zippopotamus.js [zip]');
		return process.exit(0);
	}
	var country = process.argv[2], zip = process.argv[3];
	if (process.argv.length === 3) {
		zip = country;
		country = DEFAULT_COUNTRY;
	}
	console.info('using country %s', country);
	console.info('using zip %s', zip);
	zippopotamus(country ,zip, function (err, response) {
		if (err) {
			console.error(err);
			return process.exit(1);
		}
		console.log(response);
		process.exit(1);
	});
}