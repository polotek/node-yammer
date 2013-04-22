var test = require('tape')
  , mock = require('mock')
  , sinon = require('sinon')
  , nop = function() {}
  , requestMock = nop;

var yammer = mock('./main', {
    request: function() {
      return requestMock.apply(null, arguments);
    }
  }, require)
  , Yammer = yammer.Yammer;


test('access_token is added as authorization header', function(t) {
  requestMock = sinon.spy();

  var yam = new Yammer({
    access_token: 'test_token'
  });

  yam._req({
    uri: '/test'
  }, nop);

  t.ok(requestMock.calledWith({
    uri: '/test'
    , headers: {
      authorization: 'Bearer test_token'
    }
  }));

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
