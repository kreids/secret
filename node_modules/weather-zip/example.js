var Weather = require("./index.js");

weather = new Weather("YOUR_FORECASTIO_KEY");

weather.get("90210")
.then(function (data){
  console.log(data);
});
