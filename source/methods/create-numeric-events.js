var pryv = require('pryv'),
  async = require('async'),
  _ = require('lodash');

/**
 * Generates batch call data array to generate events according to the provided parameters.
 * Each event type provided in params.data has the following structure:
 *    - value: mean value
 *    - variance: delta
 *    these two fields define the range in which the events' content will be created:
 *    [value-variance; value+variance]
 *    - type: the type of the events
 *    - steamId: the streamId (needs to be created beforehand)
 * Each of these events will be created {numDays} times, once per day at the same time as {endTime}.
 * e.g.:
 *  - endTime: 1469712094 (July 28th 2016, 13:21:34 UTC)
 *  - numDays: 10
 *  this will created 10 events from July 19th to 28th at 13:21:34 UTC
 *
 * @param params
 *          endTime {Number}
 *          numDays {Number}
 *          data {Array}
 *            value {Number}
 *            variance {Number}
 *            type {String}
 *            streamId {String}
 *
 * @returns {Array}
 */
module.exports = function createNumericEvents(params) {

  var secondsInDay = 60 * 60 * 24;
  var baseTime = params.endTime - secondsInDay * params.numDays;

  var events = [];
  for (var i = 0; i < params.numDays; i++) {

    var currentTime = baseTime + i * secondsInDay;

    params.data.forEach(function (e) {
      events.push(
        {
          method: 'events.create',
          params: {
            time: currentTime,
            type: e.type,
            streamId: e.streamId,
            content: rand(e.value, e.variance)
          }
        })
    });
  }
  return events;

  // the random number is inside [base-var; base+var]
  function rand(base, variance) {
    return Math.random() * (2 * variance) + base - variance;
  }
}
