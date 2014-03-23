function Threads(yammer) {
  this.hostname = yammer.opts.hostname;
  this.request = yammer.request.bind(yammer);
}

module.exports = Threads;

Threads.prototype.byId = function (id, opts, cb) {
  this.request(this.hostname + '/api/v1/threads/'+id, opts, cb);
};
