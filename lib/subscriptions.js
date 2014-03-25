function Subscriptions(yammer) {
  this.hostname = yammer.opts.hostname;
  this.request = yammer.request.bind(yammer);
  this._boolCb = yammer._boolCb.bind(yammer);
}

module.exports = Subscriptions;

Subscriptions.prototype.toUser = function (userid, opts, cb) {
  var args = this._boolCb(this.hostname + '/api/v1/subscriptions/to_user/'+userid
    , opts, cb);
  this.request(args.uri, args.options, args.callback);
};

Subscriptions.prototype.toTag = function (tagid, opts, cb) {
  var args = this._boolCb(this.hostname + '/api/v1/subscriptions/to_tag/'+tagid
    , opts, cb);
  this.request(args.uri, args.options, args.callback);
};

Subscriptions.prototype.toThread = function (threadid, opts, cb) {
  var args = this._boolCb(this.hostname + '/api/v1/subscriptions/to_thread/'+threadid
    , opts, cb);
  this.request(args.uri, args.options, args.callback);
};

Subscriptions.prototype.toTopic = function (topicid, opts, cb) {
  var args = this._boolCb(this.hostname + '/api/v1/subscriptions/to_topic/'+topicid
    , opts, cb);
  this.request(args.uri, args.options, args.callback);
};
