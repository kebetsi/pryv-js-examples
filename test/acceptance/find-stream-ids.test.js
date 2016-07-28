/* global describe, it, before, after */

var pyUtils = require('../../source/main'),
  pryv = require('pryv');

describe('copyData', function () {
  this.timeout(10000);

  it('must display the ids of the requested streams', function (done) {

    var connection = new pryv.Connection({
      username: 'anamaria',
      auth: 'cir6b95ne505dzqyqqq6e7fy9',
      domain: 'pryv.me'
    });

    findStreamIds(connection, ['Blood pressure', 'Health', 'Glycemia'], function (err, res) {
      console.log(res);
    });

  });


});


