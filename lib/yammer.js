var request = require('request')
  , mixin = require('otools').mixin;

var slice = Array.prototype.slice
  , initParams = request.initParams;

// Endpoint group submodules
var Groups = require('./groups');
var Invitations = require('./invitations');
var Messages = require('./messages');
var Networks = require('./networks');
var Presences = require('./presences');
var Realtime = require('./realtime');
var Relationships = require('./relationships');
var Search = require('./search');
var Subscriptions = require('./subscriptions');
var Suggestions = require('./suggestions');
var Threads = require('./threads');
var Tokens = require('./tokens');
var Topics = require('./topics');
var Users = require('./users');


function Yammer (opts) {

  if (!(this instanceof Yammer)) {
    return new Yammer(opts);
  }

  this.opts = mixin({
    hostname: 'https://www.yammer.com'
  }, opts);

  // Initialise each of the sub-apis.
  this.groups = new Groups(this);
  this.invitations = new Invitations(this);
  this.messages = new Messages(this);
  this.networks = new Networks(this);
  this.presences = new Presences(this);
  this.realtime = new Realtime(this);
  this.relationships = new Relationships(this);
  this.search = new Search(this);
  this.subscriptions = new Subscriptions(this);
  this.suggestions = new Suggestions(this);
  this.threads = new Threads(this);
  this.tokens = new Tokens(this);
  this.topics = new Topics(this);
  this.users = new Users(this);
}

Yammer.prototype.request = function (uri, opts, cb) {
  var args = initParams(uri, opts, cb);

  // console.log(args);
  uri = args.uri;
  opts = args.options;
  cb = args.callback;

  // Remove this ambiguity around which uri is the right one
  opts.uri = null;
  opts.url = null;

  // Payload is always json.
  opts.json = true;

  // URI always includes .json extension.
  uri += '.json';

  if (!opts.headers) { opts.headers = {}; }
  if (this.opts.access_token) {
    opts.headers.authorization = 'Bearer ' + this.opts.access_token;
  }

  request(uri, opts, function (err, resp, body) {
    if (err) { return cb(err); }
    if (resp.statusCode > 399) {
      return cb(new Error('Error status '+resp.statusCode+'\n'), body, resp);
    }

    return cb(null, body, resp);
  });
};

function formError(name, cb) {
  return process.nextTick(function() {
    return cb(new Error(name + ' requires form data'));
  });
}

Yammer.prototype._formpost = function (url, opts, cb) {
  var headers = opts.headers || {};
  headers['content-type'] = 'application/x-www-form-urlencoded';
  opts.headers = headers;

  opts.method = 'POST';

  this.request(url, opts, cb);
};

Yammer.prototype._boolCb = function(uri, opts, cb) {
  var ret = {}
    , args = initParams(uri, opts, cb);

  cb = args.callback;

  return {
    uri: args.uri
    , options: args.options
    , callback: function boolCallback(e, body, resp) {
      if (resp.statusCode === 404) {
        return cb(null, false);
      }
      if (e) { return cb(e, body); }

      return cb(null, body);
    }
  }
};

module.exports = Yammer;
