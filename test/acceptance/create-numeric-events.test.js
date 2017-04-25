/* global describe, it, before, after */

var pyUtils = require('../../source/main'),
    should = require('should');

describe('createNumericEvents', function () {
  this.timeout(10000);

  it('must generate the requested data', function () {

    var params = {
      endTime: 1469699555,
      numDays: 4,
      frequency: 2,
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
          streamId: 'Gylcemia-1234'
        }
      ]
    };

    var createEvents = pyUtils.createNumericEvents(params);

    should.exist(createEvents);
    createEvents.length.should.eql(params.data.length * Math.floor(params.numDays / params.frequency));

    var d = params.data,
        len = d.length,
        cnt = 0,
        eventData,
        c;

    console.log('createEv', createEvents)

    createEvents.forEach(function (batchMethod, i) {
      batchMethod.method.should.eql('events.create');
      eventData = batchMethod.params;




      switch(i) {
        case 0:
          c = d[0];
          eventData.type.should.eql(c.type);
          eventData.content.should.be.within(c.value - c.variance, c.value+ c.variance);
          eventData.streamId.should.eql(c.streamId);
      }
    });
  });


});

