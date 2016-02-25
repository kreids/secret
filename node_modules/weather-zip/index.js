var Promise = require("bluebird");
var zipp = Promise.promisify(require("node-zippopotamus"));
var Forecast = require("forecast.io-bluebird");

var Weather = function (key) {
  forecast = new Forecast({
    key: key,
    timeout: 2500
  });

  this.get = function (zipCode){
    return zipp("us", zipCode)
    .then(function (data) {
      var coords = {
        "latitude": data.places[0].latitude,
        "longitude": data.places[0].longitude
      }
      return forecast.fetch(coords.latitude, coords.longitude);
    });
  }
}

module.exports = Weather;
