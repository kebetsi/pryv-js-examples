var pryv = require('pryv'),
  async = require('async'),
  _ = require('lodash');

var connection = new pryv.Connection({
  username: 'anamaria',
  auth: 'cir6b95ne505dzqyqqq6e7fy9',
  domain: 'pryv.me'
});

getStreamIds(connection, ['Blood pressure', 'Health', 'Glycemia'], function (err, res) {
  console.log(res);
});

/**
 * Returns the streamIds of the requested streams.
 * The format is an object:
 * {
 *  streamName1: [{
 *                  id: 12315524insoin,
 *                  parentId: 83bj2319283
 *                },
 *                {
 *                  id: 131o231235n,
 *                  parentId: null
 *                }]
 *  streamName2: [{
 *                  id: ih213oih3iu5,
 *                  parentId: 1io2n3h235oi2h3
 *                }],
 *                ...
 * }
 *
 * @param connection {pryv.Connection}
 * @param streamNames {Array}
 * @param callback {Function}
 */
function getStreamIds(connection, streamNames, callback) {

  async.series([
    function getStructure (stepDone) {
      connection.fetchStructure(function (err) {
        if (err) {
          return stepDone(err);
        }
        stepDone();
      });
    },
    function getStreams (stepDone) {
      connection.streams.getFlattenedObjects({}, function (err, streams) {
        if (err) {
          return stepDone(err);
        }
        var matched = {};
        streams.forEach(function (s) {
          if (streamNames.indexOf(s.name) >= 0) {
            if (!matched[s.name]) {
              matched[s.name] = [];
            }
            matched[s.name].push({
              id: s.id,
              parentId: s.parentId
            });
          }
        });
        stepDone(null, matched);
      });
    }
  ], function (err, res) {
    if (err) {
      return callback(err);
    }
    callback(null, res[1]);
  });
}