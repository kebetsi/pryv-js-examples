# Pryv JS utils

Utilitary methods for Pryv data manipulation in Node.js

## Usage

add the following line to your package.json dependencies:  

`"pyUtils":"git+ssh://git@github.com:kebetsi/pryv-js-utils.git"`  

Then in your code, use:  

`var pyUtils = require('pyUtils');`

### pyUtils.copyData(params, callback)



Copies one stream's events from one Pryv account to another.  
**params**:   
  - sourceConnection {pryv.Connection}  
  - destinationConnection {pryv.Connection}  
  - sourceStreamId {String}  
  - destinationStreamId {String}  
  - getEventsFilter {Object} (optional) filter for fetching the events according to http://api.pryv.com/reference/#get-events  
  - filtering {Number} (optional) allows to get only 1 event for every n (eg.: if filtering=5, only each 5th event will be copied)  

```javascript
var sourceConnection = new pryv.Connection({
  username: 'jeremy',
  auth: '123tokenabc',
  domain: 'pryv.me'
}),
    destinationConnection = new pryv.Connection({
  username: 'bob',
  auth: 'myvalidToken12nin3',
  domain: 'pryv.me'
});

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

Creates an array of batch method calls for Events creation. This is used for events of [numerical](http://api.pryv.com/event-types/#numerical-types) type.

The params object has the following fields:
- data: array of the following:  
  - value: mean value
  - variance: delta  
    these two fields define the range in which the events' content will be created:
    [value-variance; value+variance]
  - type: the type of the events
  - streamId: the stream to which the events shall be added   
- endTime: the timestamp of the last event
- numDays: the number of times each event type will be created.  
Each of these events will be created *numDays* times, once per day at the same time as *endTime*.  
e.g.:  
  - endTime: 1469712094 (July 28th 2016, 13:21:34 UTC)  
  - numDays: 10  
This will create 10 events from July 19th to 28th at 13:21:34 UTC

```javascript
var params = {
  endTime: 1469699555,
  numDays: 2,
  data: [
    {
      value: 120,
      variance: 20,
      type: 'pressure/mmhg',
      streamId: 'High-pressure-1234'
    },
    {
      value: 80,
      variance: 20,
      type: 'pressure/mmhg',¬
      streamId: 'Low-pressure-1234'
    },
    {
      value: 70,
      variance: 20,
      type: 'frequency/bpm',
      streamId: 'Heart-rate-1234'
    },
    {
      value: 2000,
      variance: 200,
      type: 'energy/cal',
      streamId: 'Total-calories-1234'
    },
    {
      value: 5000,
      variance: 2000,
      type: 'count/steps',
      streamId: 'Aerobics-1234'
    },
    {
      value: 5.25,
      variance: 0.8,
      type: 'density/mmol-l',
      streamId: 'Gylcemia-1234'
    }
  ]
};

var createEvents = pyUtils.createNumericEvents(params);
```

### pyUtils.findStreamIds(connection, streamNames, callback)

Returns the stream Ids of the array of streams provided in parameter.

```javascript
var connection = new pryv.Connection({
  username: 'bob',
  auth: '123token123',
  domain: 'pryv.me'
  });

pyUtils.findStreamIds(connection, ['Blood pressure', 'Health', 'Glycemia'], function (err, res) {
  console.log(res);
});
```

## Contribute

`npm install` to download the dependencies

`npm test` runs the test suite

## License

MIT license
