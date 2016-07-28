var pryv = require('pryv'),
  async = require('async'),
  _ = require('lodash');

var sourceConnection = new pryv.Connection({
    username: 'javalibtest',
    auth: 'ciqnpjz9u0gly91pny34szs2e',
    domain: 'pryv.me'
  }),
  destinationConnection = new pryv.Connection({
    username: 'javalibtest2',
    auth: 'cir6aw6yx504zzqyq1zpaysig',
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


copyData(params, function (err, res) {
  if (err) {
    return console.log('error:\n', err);
  }
  res.forEach(function (r) {
    console.log(r);
  })
});

/**
 * Copies events from one Pryv account to another
 *
 * @param params
 *          sourceConnection {pryv.Connection}
 *          destinationConnection {pryv.Connection}
 *          sourceStreamId {String}
 *          destinationStreamId {String}
 *          getEventsFilter {Object} (optional) filter for fetching the events according to
 *                http://api.pryv.com/reference/#get-events
 *          filtering {Number} (optional) allows to get only 1 event for every n (eg.: if
 *                filtering=5, only each 5th event will be copied)
 * @param callback
 */
function copyData(params, callback) {

  if (!params.filtering) {
    params.filtering = 1;
  }

  if (!params.getEventsFilter) {
    params.getEventsFilter = {};
  }

  var createEvents = [];

  async.series([
      function fetchDataOnSource (stepDone) {

        var filter = _.extend(params.getEventsFilter, {streams: [params.sourceStreamId]});

        params.sourceConnection.events.get(filter,
          function (err, events) {
            if (err) {
              return stepDone(err);
            }
            events.forEach(function (event, i) {
              if (i % params.filtering == 0) {
                createEvents.push({
                  method: 'events.create',
                  params: _.extend(_.pick(event, ['time', 'type', 'value']),
                    {streamId: params.destinationStreamId})
                });
              }
            });
            stepDone();
          })
      },
      function createDataOnDestination (stepDone) {
        destinationConnection.batchCall(createEvents, function (err, res) {
          if (err) {
            return stepDone(err);
          }
          stepDone(null, res);
        })
      }
    ], function (err, res) {
      callback(err, res[1]);
    }
  );
}
