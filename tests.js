var test = require('tape')
  , mock = require('mock')
  , sinon = require('sinon')
  , request = require('request')
  , nop = function() {}
  , requestMock = nop;

var requestModule = function() {
  return requestMock.apply(null, arguments);
};
requestModule.initParams = request.initParams;

var yammer = mock('./main', {
    request: requestModule
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

  t.ok(requestMock.calledWithMatch('/test', {
    headers: {
      authorization: 'Bearer test_token'
    }
  }), 'oauth token present in headers');

  return t.end();
});

test('json format is added by default', function(t) {
  requestMock = sinon.spy();

  var yam = new Yammer();

  yam.request({
    uri: '/test.'
  }, nop);

  t.ok(requestMock.calledWithMatch('/test.json'), 'url has json format');

  return t.end();
});


test('json response is parsed automatically', function(t) {
  requestMock = sinon.stub().callsArgWith(2
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

  t.ok(spy.calledWithMatch(null, { test: 'json' }), 'json response is parsed');
  return t.end();
});

test('400 response returns error', function(t) {
  requestMock = sinon.stub().callsArgWith(2
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

  t.ok(spy.calledWithMatch(Error), 'error on 400 response');
  return t.end();
});

test('500 response returns error', function(t) {
  requestMock = sinon.stub().callsArgWith(2
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

  t.ok(spy.calledWithMatch(Error), 'error on 500 response');
  return t.end();
});

test('boolean callbacks return false for 404', function(t) {
  requestMock = sinon.stub().callsArgWith(2
    , null
    , {
      statusCode: 404
    }
    , '');

  var spy = sinon.spy()
  , yam = new Yammer();

  yam.checkUserSubscription('id', spy);

  t.ok(spy.calledWith(null, false), 'checkUserSubscription boolean');

  yam.checkTagSubscription('id', spy);

  t.ok(spy.calledWith(null, false), 'checkTagSubscription boolean');

  yam.checkThreadSubscription('id', spy);

  t.ok(spy.calledWith(null, false), 'checkThreadSubscription boolean');

  yam.checkTopicSubscription('id', spy);

  t.ok(spy.calledWith(null, false), 'checkTopicSubscription boolean');

  return t.end();
});

test('qs property is passed through as query parameters', function(t) {
  requestMock = sinon.spy();

  var yam = new Yammer();

  yam.request({
    uri: '/test'
    , qs: {
      test_prop: "test_value"
    }
  }, nop);

  t.ok(requestMock.calledWithMatch('/test', {
    qs: {
      test_prop: 'test_value'
    }
  }), 'yam.request sends query parameters');

  return t.end();
});

test('form encoded data is sent', function(t) {
  requestMock = sinon.spy();

  var yam = new Yammer();

  yam.createMessage({ test_prop: 'test_value' }, nop);

  t.ok(requestMock.calledWithMatch('/api/v1/messages.json', {
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    }
    , form: {
      test_prop: 'test_value'
    }
  }), 'yam.request sends query parameters');

  return t.end();
});
