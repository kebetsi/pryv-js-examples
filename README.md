# Pryv JS utils

Utilitary methods for Pryv data manipulation in Node.js

## Usage

add the following line to your package.json dependencies:  

`"pryv-utils":"git+ssh://git@github.com:kebetsi/pryv-js-utils.git"`  

Then in your code, use:  

`var pyUtils = require('pryv-utils');`

### pyUtils.copyData(params, callback)

Copies one stream's events from one Pryv account to another.
If no target stream is provided, copies the source stream as well.

### params:   
  - sourceConnection {pryv.Connection}  
  - targetConnection {pryv.Connection}  
  - sourceStream {Stream-like} requires only id
  - targetStream {Stream-like} requires only id
  - getEventsFilter {Object} (optional) filter for fetching the events according to http://api.pryv.com/reference/#get-events, default: {limit:10000}
  - filtering {Number} (optional) allows to get only 1 event for every n (eg.: if filtering=5, only each 5th event will be copied)
  - isStrict {Boolean} if set, ignores substreams and subevents

```javascript
var pryv = require('pryv'),
    pyUtils = require('pryv-utils';

var sourceConnection = new pryv.Connection({
  username: 'jeremy',
  auth: '123tokenabc',
  domain: 'pryv.me'
}),
    targetConnection = new pryv.Connection({
  username: 'bob',
  auth: 'myvalidToken12nin3',
  domain: 'pryv.me'
});

var srcStream = {
    id: 'test',
    name: 'Test'
},  tgtStream = {
    id: 'copy-data',
    name: 'Dest'
};

var params = {
  sourceConnection: sourceConnection,
  targetConnection: targetConnection,
  sourceStream: srcStream,
  targetStream: tgtStream,
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

### pyUtils.createNumericEvents(params)

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
- numDays: the number of times each event type will be created
- frequency: the rate at which events are created. Ex.: if 2, every 2 days, if 3 every 3 days, etc
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
      type: 'pressure/mmhg',
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
      streamId: 'Glycemia-1234'
    }
  ]
};

var createEvents = pyUtils.createNumericEvents(params);
```

### pyUtils.findStreamIds(connection, streamNames, callback)

Returns the stream Ids of the array of streams names provided in parameter.

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
