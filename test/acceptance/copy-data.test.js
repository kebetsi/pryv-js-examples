/* global describe, it, before, after */

var pyUtils = require('../../source/main'),
  pryv = require('pryv'),
  should = require('should'),
  async = require('async'),
  inspect = require('util').inspect;

describe('copyData', function () {
  this.timeout(10000);

  var sourceConnection = new pryv.Connection({
      username: 'iliautils',
      auth: 'ciy4qkv9p000r4s576qg6f9sb',
      domain: 'pryv.li'
    }),
    targetConnection = new pryv.Connection({
      username: 'iliautils2',
      auth: 'ciy4qlxqh000w4s57c4b9r65c',
      domain: 'pryv.li'
    });

  var testStream = {
    id: 'test-stream-id',
    name: 'testSream'
  };

  before(function (done) {
    var batch = [
      {
        method: 'streams.create',
        params: testStream
      },
      {
        method: 'streams.create',
        params: {
          id: 'firstChild',
          name: 'first child',
          parentId: testStream.id
        }
      },
      {
        method: 'streams.create',
        params: {
          id: 'secondChild',
          name: 'second child',
          parentId: testStream.id
        }
      },
      {
        method: 'events.create',
        params: {
          streamId: testStream.id,
          type: 'note/txt',
          content: 'hi, i am in root'
        }
      },
      {
        method: 'events.create',
        params: {
          streamId: 'firstChild',
          type: 'note/txt',
          content: 'hi, i am in firstChild'
        }
      },
      {
        method: 'events.create',
        params: {
          streamId: 'secondChild',
          type: 'note/txt',
          content: 'hi, i am in secondChild'
        }
      }
    ];
    sourceConnection.batchCall(batch, function (err, res) {
      if (err) {
        return done(err);
      }
      console.log(res);
      done();
    })
  });

  after(function (done) {
    var batch = [
      {
        method: 'streams.delete',
        params: {
          id: testStream.id
        }
      },
      {
        method: 'streams.delete',
        params: {
          id: testStream.id,
          mergeEventsWithParent: false
        }
      }
    ]
    console.log('#######')
    console.log('## running after ##')
    console.log('#######')
    async.series([
      function deleteInSource(stepDone) {
        sourceConnection.batchCall(batch, function (err, res) {
          if (err) {
            return done(err);
          }
          console.log(res);
          stepDone();
        })
      },
      function deleteInTarget(stepDone) {
        targetConnection.batchCall(batch, function (err, res) {
          if (err) {
            return done(err);
          }
          console.log(res);
          stepDone();
        });
      }
    ], done);
  })

  it('must copy the data from an account in another, creating the sourceStream in the target if not provided.',
    function (done) {

      var params = {
        sourceConnection: sourceConnection,
        targetConnection: targetConnection,
        sourceStream: testStream,
        targetStream: null,
        getEventsFilter: {
          limit: 1000,
          streamId: testStream.id
        }
      };

      async.series([
        function copyData(stepDone) {
          console.log('copy results')
          pyUtils.copyData(params, function (err, res) {
            should.not.exist(err);
            should.exist(res);
            res.forEach(function (r) {
              console.log(inspect(r, {showHidden: false, depth: null}));
            });
            done(err);
          });
        },
        function verifyStreams(stepDone) {
          targetConnection.streams.get(null, function (err, streams) {
            if (err) {
              return stepDone(err);
            }
            var copiedRootStream = streams.find(function (s) {
              s.id === testStream.id;
            });
            copiedRootStream.should.not.be.null;
            copiedRootStream.children.find(function (s) {
              s.id == 'firstChild';
            }).should.not.be.null;
            copiedRootStream.children.find(function (s) {
              s.id == 'secondChild';
            }).should.not.be.null;
          });
        },
        function verifyEvents(stepDone) {
          targetConnection.events.get({}, function (err, events) {
            if (err) {
              return stepDone(err);
            }
            events.length.should.eql(3);
            events.forEach(function (e) {
              e.type.should.eql('note/txt');
            });
          });
        }
      ], done);
    });


});