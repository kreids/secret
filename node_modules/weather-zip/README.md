# weather-zip
Get weather information from zip code

# install
`npm install --save weather-zip`

# Use
```
var Weather = require("weather-zip");

weather = new Weather("YOUR_FORECASTIO_KEY");

weather.get("90210")
.then(function (data){
  console.log(data);
});
'''
