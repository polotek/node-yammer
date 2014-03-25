function Presences(yammer) {
  this.hostname = yammer.opts.hostname;
  this.request = yammer.request.bind(yammer);
}

module.exports = Presences;

Presences.prototype.all = function (opts, cb) {
  this.request(this.hostname + '/api/v1/presences', opts, cb);
};

Presences.prototype.byFollowing = function (opts, cb) {
  this.request(this.hostname + '/api/v1/presences/by_following', opts, cb);
};
