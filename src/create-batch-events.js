var pryv = require('pryv'),
  async = require('async'),
  _ = require('lodash');

var params = {
  endTime: 1469699555,
  numDays: 2,
  data: [
    {
      content: 120,
      variance: 20,
      type: 'pressure/mmhg',
      streamId: 'cir4pm1sb4ynjzqyqqx4i43vb',
      streamName: 'High pressure'
    },
    {
      content: 80,
      variance: 20,
      type: 'pressure/mmhg',
      streamId: 'cir4pml4r4ynlzqyq0c6hh6g8',
      streamName: 'Low pressure'
    },
    {
      content: 70,
      variance: 20,
      type: 'frequency/bpm',
      streamId: 'cir4gwblt4ylkzqyq4bc3bny8',
      streamName: 'Heart rate'
    },
    {
      content: 2000,
      variance: 200,
      type: 'energy/cal',
      streamId: 'cir4gbcag4yk9zqyqwb399apr',
      streamName: 'Total calories'
    },
    {
      content: 5000,
      variance: 2000,
      type: 'count/steps',
      streamId: 'cir4gjg004ykszqyqfrrdaj72',
      streamName: 'Aerobics'
    },
    {
      content: 5.25,
      variance: 0.8,
      type: 'density/mmol-l',
      streamId: 'cir4gyhok4ylozqyqm2bslcqj',
      streamName: 'Gylcemia'
    }
  ]
};

var createEvents = generateEventsCreation(params);

createEvents.forEach(function (e) {
  console.log(e);
});

/**
 * Generate Events of the provided types and values for the last X days.
 *
 * @returns {Array}
 */
function generateEventsCreation(params) {

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
            content: rand(e.content, e.variance)
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
