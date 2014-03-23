function Networks(yammer) {
  this.hostname = yammer.opts.hostname;
  this.request = yammer.request.bind(yammer);
}

module.exports = Networks;

Networks.prototype.current = function (opts, cb) {
  this.request(this.hostname + '/api/v1/networks/current', opts, cb);
};
