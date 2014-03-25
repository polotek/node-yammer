function Suggestions(yammer) {
  this.hostname = yammer.opts.hostname;
  this.request = yammer.request.bind(yammer);
}

module.exports = Suggestions;

Suggestions.prototype.all = function (opts, cb) {
  this.request(this.hostname + '/api/v1/suggestions', opts, cb);
};

Suggestions.prototype.users = function (opts, cb) {
  this.request(this.hostname + '/api/v1/suggestions/users', opts, cb);
};
