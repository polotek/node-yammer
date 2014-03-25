function Topics(yammer) {
  this.hostname = yammer.opts.hostname;
  this.request = yammer.request.bind(yammer);
};

module.exports = Topics;

Topics.prototype.byId = function (id, opts, cb) {
  this.request(this.hostname + '/api/v1/topics/'+id, opts, cb);
};
