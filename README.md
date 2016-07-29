# Pryv JS utils

Utilitary methods for Pryv data manipulation in Node.js

## Usage

add the following line to your package.json dependencies:  

`"pyUtils":"git+ssh://git@github.com:kebetsi/pryv-js-utils.git"`  

Then in your code, use:  

`var pyUtils = require('pyUtils');`

### pyUtils.copyData(params, callback)

Copies events from one Pryv account to another.  
**params**:   
  - sourceConnection {pryv.Connection}  
  - destinationConnection {pryv.Connection}  
  - sourceStreamId {String}  
  - destinationStreamId {String}  
  - getEventsFilter {Object} (optional) filter for fetching the events according to   
        http://api.pryv.com/reference/#get-events  
  - filtering {Number} (optional) allows to get only 1 event for every n (eg.: if  
                     filtering=5, only each 5th event will be copied)  

```javascript
var params = {
  sourceConnection: sourceConnection,
  destinationConnection: destinationConnection,
  sourceStreamId: 'test',
  destinationStreamId: 'copy-data-stream',
  getEventsFilter: {
    limit: 1000
  },
  filtering: 10
};


pyUtils.copyData(params, function (err, res) {
  if (err) {
    return console.log(err);
  }
  res.forEach(function (r) {
    console.log(r);
  });
});
```

### pyUtils.createNumericEvents(params, callback)

### pyUtils.findStreamIds(params, callback)

## Contribute

`npm install` to download the dependencies

`npm test` runs the test suite

## License

MIT license