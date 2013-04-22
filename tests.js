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

  yam.request({
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
  requestMock = sinon.spy();

  var yam = new Yammer();

  yam.request({
    uri: '/test.'
  }, nop);

  t.ok(requestMock.calledWithMatch({ uri: '/test.json' }));

  t.end();
});


test('json response is parsed automatically', function(t) {
  requestMock = sinon.stub().callsArgWith(1
    , null
    , {
      statusCode: 200
      , headers: {
        'content-type': 'application/json'
      }
    }
    , '{ "test": "json" }');

  var spy = sinon.spy()
  , yam = new Yammer();

  yam.request({
    uri: '/test.json'
  }, spy);

  t.ok(spy.calledWith(null, { test: 'json' }));
  t.end();
});

test('400 response returns error', function(t) {
  requestMock = sinon.stub().callsArgWith(1
    , null
    , {
      statusCode: 404
    }
    , '');

  var spy = sinon.spy()
  , yam = new Yammer();

  yam.request({
    uri: '/test.json'
  }, spy);

  t.ok(spy.calledWithMatch(Error));
  t.end();
});

test('500 response returns error', function(t) {
  requestMock = sinon.stub().callsArgWith(1
    , null
    , {
      statusCode: 500
    }
    , '');

  var spy = sinon.spy()
  , yam = new Yammer();

  yam.request({
    uri: '/test.json'
  }, spy);

  t.ok(spy.calledWithMatch(Error));
  t.end();
});

test('boolean callbacks return false for 404', function(t) {
  requestMock = sinon.stub().callsArgWith(1
    , null
    , {
      statusCode: 404
    }
    , '');

  var spy = sinon.spy()
  , yam = new Yammer();

  yam.checkUserSubscription('id', spy);

  t.ok(spy.calledWith(null, false));

  yam.checkTagSubscription('id', spy);

  t.ok(spy.calledWith(null, false));

  yam.checkThreadSubscription('id', spy);

  t.ok(spy.calledWith(null, false));

  yam.checkTopicSubscription('id', spy);

  t.ok(spy.calledWith(null, false));

  t.end();
});
