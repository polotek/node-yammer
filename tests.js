var test = require('tape')
  , mock = require('mock')
  , sinon = require('sinon')
  , nop = function() {}
  , requestMock = nop;

var Yammer = mock('./main', {
    request: function() {
      requestMock.apply(null, arguments);
    }
  }, require).Yammer;


test('access_token is added as authorization header', function(t) {
  requestMock = sinon.expectation.create()
    .withArgs({
      uri: '/test'
      , headers: {
        authorization: 'Bearer test_token'
      }
    });

  var yam = new Yammer({
    access_token: 'test_token'
  });

  yam._req({
    uri: '/test'
  }, nop);

  t.doesNotThrow(function() {
    requestMock.verify();
  });

  t.end();
});

test('json format is added by default', function(t) {
  requestMock = sinon.expectation.create()
    .withArgs({
      uri: '/test.json'
      , headers: {
        authorization: 'Bearer test_token'
      }
    });

  var yam = new Yammer({
    access_token: 'test_token'
  });

  yam._req({
    uri: '/test.'
  }, nop);

  t.doesNotThrow(function() {
    requestMock.verify();
  });

  t.end();
});
