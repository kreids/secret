# node-zippopotamus

Wraps the simple zippopotam.us HTTP endpoint for resolving a zip code to latitutde/longitude coordinates.

## Usage

```
$ npm install node-zippopotamus
```

### as a required module

```javascript
var zipp = require('node-zippopotamus');

zipp('us', '63031', function (err, json) {
  //json is an object
});

/*defaults to country 'us'*/
zipp('63031', function (err, json) {
  //json is an object
});
```

### from the CLI

```
$ node ./node_modules/node-zippopotamus us 63031
$ node ./node_modules/node-zippopotamus 63031
```