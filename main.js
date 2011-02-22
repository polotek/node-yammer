var request = require('request')

function Yammer (opts) {
  this.opts = opts;
}
Yammer.prototype._req = function (opts, cb) {
  var auth = 'OAuth ' +
             'oauth_consumer_key="'+this.opts.oauth_consumer_key+'",' +
             'oauth_token="'+this.opts.oauth_token+'",' +
             'oauth_signature_method="'+ (this.opts.oauth_signature_method || "PLAINTEXT") + '",' +
             'oauth_timestamp="'+(this.opts.oauth_timestamp || (new Date()).getTime())+'",' +
             'oauth_nonce="'+(this.opts.oauth_nonce || Math.floor(Math.random()*1111111111))+'",' +
             'oauth_verifier="'+this.opts.oauth_verifier+'",' +
             'oauth_signature="'+this.opts.oauth_signature+'%26'+this.opts.oauth_token_secret+'"'
             ;
  
  if (opts.uri[opts.uri.length - 1] === '.') {
    opts.uri += this.opts.format;
  }
  if (!opts.headers) opts.headers = {};
  opts.headers.authorization = auth;

  request(opts, function (e, resp, body) {
    if (e) return cb(e);
    
    if (resp.statusCode > 399) {
      return cb(new Error('Error status '+resp.statusCode+'\n'), resp);
    }

    if (resp.headers['content-type'].slice(0, 'application/json'.length) === 'application/json') {
      cb(null, JSON.parse(body));
    } else {
      cb(null, body);
    }
  })
}
Yammer.prototype._get = function (url, cb) {
  this._req({uri:url, method:'GET'}, cb);
}
Yammer.prototype._formpost = function (url, data, cb) {
  this._req({uri:url, method:'POST', body:qs.stringify(data)}, cb)
}
Yammer.prototype._post = function (url, data, cb) {
  this._req({uri:url, method:'POST', body:JSON.stringify(data), headers:{'content-type':'application/json'}}, cb)
}

Yammer.prototype.messages = function (cb) {
  this._get('https://www.yammer.com/api/v1/messages.', cb);
}
Yammer.prototype.messagesSent = function (cb) {
  this._get('https://www.yammer.com/api/v1/messages/sent.', cb);
}
Yammer.prototype.messagesReceived = function (cb) {
  this._get('https://www.yammer.com/api/v1/messages/received.', cb);
}
Yammer.prototype.messagesFollowing = function (cb) {
  this._get('https://www.yammer.com/api/v1/messages/following.', cb);
}
Yammer.prototype.messagesFromUser = function (userid, cb) {
  this._get('https://www.yammer.com/api/v1/messages/from_user/'+userid+'.', cb);
}
Yammer.prototype.messagesFromBot = function (botid, cb) {
  this._get('https://www.yammer.com/api/v1/messages/bot_user/'+botid+'.', cb);
}
Yammer.prototype.messagesWithTag = function (tagid, cb) {
  this._get('https://www.yammer.com/api/v1/messages/tagged_with/'+tagid+'.', cb);
}
Yammer.prototype.messagesInGroup = function (groupid, cb) {
  this._get('https://www.yammer.com/api/v1/messages/in_group/'+groupid+'.', cb);
}
Yammer.prototype.messagesFavoritesOf = function (userid, cb) {
  this._get('https://www.yammer.com/api/v1/messages/favorites_of/'+userid+'.', cb);
}
Yammer.prototype.messagesInThread = function (threadid, cb) {
  this._get('https://www.yammer.com/api/v1/messages/in_thread/'+threadid+'.', cb);
}
Yammer.prototype.checkUserSubscription = function (userid, cb) {
  this._get('https://www.yammer.com/api/v1/subscriptions/to_user/'+userid+'.', function (e, body) {
    if (resp.statusCode === 404) {
      return cb(null, false);
    } 
    if (e) return cb(e, body);
    cb(null, body);
  });
}
Yammer.prototype.createMessage = function (obj, cb) {
  
}
Yammer.prototype.relationships = function (cb) {
  this._get('https://www.yammer.com/api/v1/relationships.', cb);
}
Yammer.prototype.invite = function (email, cb) {
  this._post('https://www.yammer.com/api/v1/invitations.', {email:email}, cb)
}

exports.Yammer = Yammer