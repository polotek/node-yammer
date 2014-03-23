var initParams = require('request').initParams;

function Search(yammer) {
  this.hostname = yammer.opts.hostname;
  this.request = yammer.request.bind(yammer);
}

module.exports = Search;

Search.prototype.query = function (params, opts, cb) {
  var args = initParams(this.hostname + '/api/v1/search'
    , opts, cb);

  args.options.qs = params;
  this.request(args.uri, args.options, args.callback);
};
