var initParams = require('request').initParams;

function Messages(yammer) {
  this.hostname = yammer.opts.hostname;
  this.request = yammer.request.bind(yammer);
  this._formpost = yammer._formpost.bind(yammer);
}

module.exports = Messages;

Messages.prototype.all = function (opts, cb) {
  this.request(this.hostname + '/api/v1/messages', opts, cb);
};

Messages.prototype.sent = function (opts, cb) {
  this.request(this.hostname + '/api/v1/messages/sent', opts, cb);
};

Messages.prototype.received = function (opts, cb) {
  this.request(this.hostname + '/api/v1/messages/received', opts, cb);
};

Messages.prototype.following = function (opts, cb) {
  this.request(this.hostname + '/api/v1/messages/following', opts, cb);
};

Messages.prototype.fromUser = function (userid, opts, cb) {
  this.request(this.hostname + '/api/v1/messages/from_user/'+userid, opts, cb);
};

Messages.prototype.fromBot = function (botid, opts, cb) {
  this.request(this.hostname + '/api/v1/messages/bot_user/'+botid, opts, cb);
};

Messages.prototype.withTag = function (tagid, opts, cb) {
  this.request(this.hostname + '/api/v1/messages/tagged_with/'+tagid, opts, cb);
};

Messages.prototype.inGroup = function (groupid, opts, cb) {
  this.request(this.hostname + '/api/v1/messages/in_group/'+groupid, opts, cb);
};

Messages.prototype.favoritesOf = function (userid, opts, cb) {
  this.request(this.hostname + '/api/v1/messages/favorites_of/'+userid, opts, cb);
};

Messages.prototype.likedBy = function (userid, opts, cb) {
  this.request(this.hostname + '/api/v1/messages/liked_by/'+userid, opts, cb);
};

Messages.prototype.inThread = function (threadid, opts, cb) {
  this.request(this.hostname + '/api/v1/messages/in_thread/'+threadid, opts, cb);
};

Messages.prototype.aboutTopic = function (id, opts, cb) {
  this.request(this.hostname + '/api/v1/messages/about_topic/'+id, opts, cb);
};

Messages.prototype.private = function (opts, cb) {
  this.request(this.hostname + '/api/v1/messages/private', opts, cb);
};

Messages.prototype.direct = Messages.prototype.private;

Messages.prototype.inbox = function (opts, cb) {
  this.request(this.hostname + '/api/v1/messages/inbox', opts, cb);
};

Messages.prototype.post = function (formdata, opts, cb) {
  var args = initParams(this.hostname + '/api/v1/messages'
    , opts, cb);

  args.options.form = formdata;
  this._formpost(args.uri, args.options, args.callback);
};

Messages.prototype.like = function (formdata, opts, cb) {
  var args = initParams(this.hostname + '/api/v1/messages/liked_by/current'
    , opts, cb);

  args.options.form = formdata;
  this._formpost(args.uri, args.options, args.callback);
};
