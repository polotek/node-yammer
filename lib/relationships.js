function Relationships(yammer) {
  this.hostname = yammer.opts.hostname;
  this.request = yammer.request.bind(yammer);
}

module.exports = Relationships;

Relationships.prototype.all = function (opts, cb) {
  this.request(this.hostname + '/api/v1/relationships', opts, cb);
};
