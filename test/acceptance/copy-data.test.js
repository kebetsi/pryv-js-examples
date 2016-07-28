/* global describe, it, before, after */

var pyUtils = require('../../source/main'),
    pryv = require('pryv'),
    should = require('should');

describe('copyData', function () {
  this.timeout(10000);

  it('must copy the data from an account in another if the destination stream exists and the' +
    ' tokens for both accounts are valid and have the appropriate rights', function (done) {
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


    pyUtils.copyData(params, function (err, res) {
      should.not.exist(err);
      should.exist(res);
      res.forEach(function (r) {
        console.log(r);
      });
      done(err);
    });
  });


});