function Tokens(yammer) {
  this.hostname = yammer.opts.hostname;
  this.request = yammer.request.bind(yammer);
}

module.exports = Tokens;

Tokens.prototype.all = function (opts, cb) {
  this.request(this.hostname + '/api/v1/oauth/tokens', opts, cb)
};
