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
 * @param callback
 */
module.exports = function copyData(params, callback) {
  
  if (! params.targetStream) {
    params.targetStream = _.pick(params.sourceStream,['id', 'name', 'parentId', 'trashed', 'clientData']);
  }
  console.log('target', params.targetStream);

  if (!params.filtering) {
    params.filtering = 1;
  }

  if (!params.getEventsFilter) {
    params.getEventsFilter = {};
  }

  var createEvents = [],
    createStreams = [];

  async.series([
      function fetchSubStreams(stepDone) {
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
              if (i % params.filtering == 0) {

                // if copying to other stream, update its events streamId
                if ((params.targetStream.id !== params.sourceStream.id) &&
                  (event.streamId === params.sourceStream.id)) {
                  event.streamId = params.targetStream.id;
                }
                createEvents.push({
                  method: 'events.create',
                  params: event.getData()
                });
              }
            });
            stepDone();
          })
      },
      function createDataOntarget(stepDone) {
        var data = createStreams.concat(createEvents);
        console.log('data', data);
        params.targetConnection.batchCall(data, function (err, res) {
          if (err) {
            return stepDone(err);
          }
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
