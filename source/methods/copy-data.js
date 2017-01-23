var pryv = require('pryv'),
  async = require('async'),
  _ = require('lodash');

/**
 * Copies events and substreams from one Pryv account to another.
 * If no target stream is provided, copies the source stream as well.
 *
 * @param params
 *          sourceConnection {pryv.Connection}
 *          targetConnection {pryv.Connection}
 *          sourceStream {Stream-like}
 *          targetStream {Stream-like}
 *          getEventsFilter {Object} (optional) filter for fetching the events according to
 *                http://api.pryv.com/reference/#get-events
 *          filtering {Number} (optional) allows to get only 1 event for every n (eg.: if
 *                filtering=5, only each 5th event will be copied)
 *          isStrict {boolean} (optional) If set, will not copy substreams.
 * @param callback
 */
module.exports = function copyData(params, callback) {

  if (!params.targetStream) {
    params.targetStream = _.pick(params.sourceStream, ['id', 'name', 'parentId', 'trashed', 'clientData']);
  }
  console.log('targettt', params.targetStream.id);

  if (!params.filtering) {
    params.filtering = 1;
  }

  if (!params.getEventsFilter) {
    params.getEventsFilter = {limit: 10000};
  }

  var createEvents = [],
    createStreams = [];

  var stats = {};

  async.series([
      function fetchSubStreams(stepDone) {
        if (params.isStrict) {
          return stepDone();
        }
        params.sourceConnection.streams.get({parentId: params.sourceStream.id}, function (err, streams) {
          if (err) {
            return stepDone(err);
          }
          createStreams = buildBatchFromTree(streams);

          // if copying to other stream, update its children parentId's
          if (params.sourceStream.id !== params.targetStream.id) {
            createStreams.forEach(function (s) {
              s.params.parentId = params.targetStream.id;
            });
          } else {
            createStreams.unshift({
              method: 'streams.create',
              params: params.targetStream
            })
          }

          stepDone();
        })
      },
      function fetchEventsOnSource(stepDone) {

        var filter = _.extend(params.getEventsFilter, {streams: [params.sourceStream.id]});

        params.sourceConnection.events.get(filter,
          function (err, events) {
            if (err) {
              return stepDone(err);
            }
            events.forEach(function (event, i) {
              if ((params.isStrict && event.streamId === params.sourceStream.id) ||
                (!params.isStrict)) {
                if (i % params.filtering == 0) {

                  console.log('processing', event.getData());
                  // if copying to other stream, update its events streamId
                  if ((params.targetStream.id !== params.sourceStream.id) &&
                    (event.streamId === params.sourceStream.id)) {
                    event.streamId = params.targetStream.id;
                  }


                  if (!stats[event.streamId]) {
                    stats[event.streamId] = 1
                  } else {
                    stats[event.streamId] = stats[event.streamId] + 1
                  }

                  createEvents.push({
                    method: 'events.create',
                    params: event.getData()
                  });

                }
              }
            });
            stepDone();
          })
      },
      function createDataOntarget(stepDone) {
        var data = createStreams.concat(createEvents);
        console.log('data', data.length);
        console.log('stats', stats)
        params.targetConnection.batchCall(data, function (err, res) {
          console.log('batch call err', err, 'res', res);
          if (err) {
            return stepDone(err);
          }
          console.log('batch call res', res);
          stepDone(null, res);
        })
      }
    ], function (err, res) {
      callback(err, res[2]);
    }
  );

  /**
   * Takes a Stream tree and builds an array of streams.create calls in the right order.
   *
   * @param streamTree
   * @returns {Array}
   */
  function buildBatchFromTree(streamTree) {
    var batch = [];
    treeAddStreams(streamTree);
    return batch;

    function treeAddStreams(streams) {
      _.each(streams, function (stream) {
        batch.push(streamCall(stream));
        treeAddStreams(stream.children);
      });
    }

    function streamCall(stream) {
      return {
        method: 'streams.create',
        params: _.extend(stream.getData(), {id: stream.id})
      }
    };
  };

};
