var initParams = require('request').initParams;

function Invitations(yammer) {
  this.hostname = yammer.opts.hostname;
  this._formpost = yammer._formpost.bind(yammer);
}

module.exports = Invitations;

Invitations.prototype.invite = function (formdata, opts, cb) {
  var args = initParams(this.hostname + '/api/v1/invitations'
    , opts, cb);

  args.options.form = formdata;
  this._formpost(args.uri, args.options, args.callback);
};
