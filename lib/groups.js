function Groups(yammer) {
  this.hostname = yammer.opts.hostname;
  this.request = yammer.request.bind(yammer);
}

module.exports = Groups;

Groups.prototype.all = function (opts, cb) {
  this.request(this.hostname + '/api/v1/groups', opts, cb);
};

Groups.prototype.byId = function (id, opts, cb) {
  this.request(this.hostname + '/api/v1/groups/'+id, opts, cb);
};
