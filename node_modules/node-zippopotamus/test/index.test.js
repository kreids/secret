/*global describe, it, beforeEach*/
'use strict';
var nock = require('nock'),
	assert = require('chai').assert,
	zippo = require('../index')
	;

var remote,
	mockResponse;

describe('zippopotamus', function () {
	beforeEach(function (done) {
		mockResponse = {
			'post code': '55555',
			country: 'United States',
			'country abbreviation': 'US',
			places: [
				{
					'place name': 'Some City',
					longitude: '-100.0000',
					state: 'Missouri',
					'state abbreviation': 'XX',
					latitude: '100.0000'
				}
			]
		};

		remote = nock('http://www.zippopotam.us')
			.get('/us/55555')
			.reply(200, mockResponse)
			.get('/us/66666')
			.reply(200, {})
			.get('/us/77777')
			.reply(500, {})
			.get('/us/88888')
			.reply(200, 'badjson|');

		done();
	});

	it('should generate an error when the endpoint call fails', function (done) {
		zippo('us', '77777', function (err) {
			assert.isObject(err);
			done();
		});
	});

	it('should generate an error if the endpoint returns bad json', function (done) {
		zippo('us', '88888', function (err) {
			assert.isObject(err);
			done();
		});
	});

	it('should return a valid json object for a valid response', function (done) {
		zippo('us', '55555', function (err, json) {
			assert.isUndefined(err);
			assert.isObject(json);
			assert.deepEqual(json, mockResponse);
			done();
		});
	});

	it('should supply a country automatically if one is not specified', function (done) {
		zippo('55555', function (err, json) {
			assert.isUndefined(err);
			assert.isObject(json);
			assert.deepEqual(json, mockResponse);
			done();
		});
	});
});