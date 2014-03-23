var test = require('tape');
var nock = require('nock');
var Yammer = require('./lib/yammer');

test('access_token is added as authorization header', function(t) {
  var yam = new Yammer({ access_token: 'test_token' });

  nock('https://www.yammer.dev').get('/test.json')
    .reply(200, {});

  yam.request({
    uri: 'https://www.yammer.dev/test'
  }, function (err, body, res) {
    t.equal(res.request.headers.authorization, 'Bearer test_token',
      'oauth token present in headers');
    t.end();
  });
});


test('json format is added by default', function(t) {
  var yam = new Yammer();

  nock('https://www.yammer.dev').get('/test.json')
    .reply(200, {});

  yam.request({
    uri: 'https://www.yammer.dev/test'
  }, function (err, body, res) {
    t.equal(res.request.uri.path, '/test.json', 'url has json format');
    t.end();
  });
});


test('json response is parsed automatically', function(t) {
  var yam = new Yammer();

  nock('https://www.yammer.dev').get('/test.json')
    .reply(200, { test: "json" });

  yam.request({
    uri: 'https://www.yammer.dev/test'
  }, function (err, body, res) {
    t.deepEqual(body, { test: 'json' }, 'json response is parsed');
    t.end();
  });
});


test('400 response returns error', function(t) {
  var yam = new Yammer();

  nock('https://www.yammer.dev/').get('/test.json')
    .reply(404, '');

  yam.request({
    uri: 'https://www.yammer.dev/test'
  }, function (err, body, res) {
    t.ok(err instanceof Error, 'error on 400 response');
    t.end();
  });
});


test('500 response returns error', function(t) {
  var yam = new Yammer();

  nock('https://www.yammer.dev').get('/test.json')
    .reply(500, '')

  yam.request({
    uri: 'htps://www.yammer.dev/test'
  }, function (err, body, res) {
    t.ok(err instanceof Error, 'error on 500 response');
    t.end();
  });
});


test('boolean callbacks return false for 404', function(t) {
  var yam = new Yammer({
    hostname: 'https://www.yammer.dev'
  });

  t.plan(4);

  nock('https://www.yammer.dev').get('/api/v1/subscriptions/to_user/1.json')
    .reply(404, '');

  yam.checkUserSubscription(1, function (err, body) {
    t.equal(body, false, 'checkUserSubscription boolean');
  });

  nock('https://www.yammer.dev').get('/api/v1/subscriptions/to_tag/1.json')
    .reply(404, '');

  yam.checkTagSubscription(1, function (err, body) {
    t.equal(body, false, 'checkTagSubscription boolean');
  });

  nock('https://www.yammer.dev').get('/api/v1/subscriptions/to_thread/1.json')
    .reply(404, '');

  yam.checkThreadSubscription(1, function (err, body) {
    t.equal(body, false, 'checkThreadSubscription boolean');
  });

  nock('https://www.yammer.dev').get('/api/v1/subscriptions/to_topic/1.json')
    .reply(404, '');

  yam.checkTopicSubscription(1, function (err, body) {
    t.equal(body, false, 'checkTopicSubscription boolean');
  });
});


test('qs property is passed through as query parameters', function(t) {
  var yam = new Yammer();

  nock('https://www.yammer.dev').get('/test.json?test_prop=test_value')
    .reply(200, '');

  yam.request({
    uri: 'https://www.yammer.dev/test',
    qs: {
      test_prop: 'test_value'
    }
  }, function (err, body, res) {
    t.equal(res.request.uri.query, 'test_prop=test_value',
      'yam.request sends query parameters');
    t.end();
  });
});


test('form encoded data is sent', function(t) {
  var yam = new Yammer({ hostname: 'https://www.yammer.dev' });

  nock('https://www.yammer.dev').post('/api/v1/messages.json')
    .reply(200, '');

  yam.createMessage({ test_prop: 'test_value' }, function (err, body, res) {
    var req = res.request;
    t.equal(req.headers['content-type'],
      'application/x-www-form-urlencoded; charset=utf-8',
      'content-type set correctly');
    t.equal(String(req.body), 'test_prop=test_value',
      'request body sent');
    t.end();
  });

});
