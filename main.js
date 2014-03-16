var request = require('request')
  , qs = require('querystring')
  , url = require('url')
  , mixin = require('otools').mixin;

var slice = Array.prototype.slice
  , initParams = request.initParams;


function RealTime (yam) {
  this.yam = yam;
}
RealTime.prototype.messages = function (cb) {
  this.yam.messages(function (e, body) {
    if (e) return cb(e);
    var meta = body.meta.realtime
      , id = 1
      ;
      
    request(
      { url: meta.uri + 'handshake'
      , headers: {'content-type':'application/json'}
      , method: 'POST'
      , body: JSON.stringify(
        [ { ext: {"token": meta.authentication_token}
          , version: "1.0"
          , minimumVersion: "0.9"
          , channel: "/meta/handshake"
          , supportedConnectionTypes: ["long-polling","callback-polling"]
          , id: id
          }
        ])
      }, function (e, resp, b) {
      if (e) return cb(e);
      if (resp.statusCode !== 200) return cb(new Error('Status code is not 200\n'+b))
      var handshake = JSON.parse(b)[0];
      id += 1
      request.post(
        { url: meta.uri
        , headers: {'content-type':'application/json'}
        , body: JSON.stringify(
          [ { channel: "/meta/subscribe"
            , subscription: "/feeds/" + meta.channel_id + "/primary"
            , id: id
            , clientId: handshake.clientId
            }
          , { channel: "/meta/subscribe"
            , subscription: "/feeds/" + meta.channel_id + "/secondary"
            , id: id + 1
            , clientId: handshake.clientId
            }
          ])
        }, function (e, resp, b) {
          if (e) return cb(e);
          if (resp.statusCode !== 200) return cb(new Error('Status code is not 200\n'+b))
          id += 1
          var getchannel = function () {
            id += 1
            request.post(
              { url: meta.uri + 'connect'
              , headers: {'content-type': 'application/json'}
              , body: JSON.stringify(
                [ { channel: "/meta/connect"
                  , connectionType: 'long-polling'
                  , id: id
                  , clientId: handshake.clientId 
                  }
                ])
              }, function (e, resp, b) {
                if (e) return cb(e);
                if (resp.statusCode !== 200) return cb(new Error('Status code is not 200\n'+b))
                var b = JSON.parse(b);
                b.pop()
                b.forEach(function (r) {
                  cb(null, r.data);
                })
                getchannel();
              }
            )
          }
          getchannel();
        }
      )
    })
  })
}

function Yammer (opts) {
  this.opts = mixin({
    hostname: 'http://www.yammer.com'
  }, opts);
  this.realtime = new RealTime(this);
}
Yammer.prototype._oauth = function() {
  if (this.opts.access_token) {
    return 'Bearer ' + this.opts.access_token;
  }

  return 'OAuth ' +
   'oauth_consumer_key="'+this.opts.oauth_consumer_key+'",' +
   'oauth_token="'+this.opts.oauth_token+'",' +
   'oauth_signature_method="'+ (this.opts.oauth_signature_method || "PLAINTEXT") + '",' +
   'oauth_timestamp="'+(this.opts.oauth_timestamp || (new Date()).getTime())+'",' +
   'oauth_nonce="'+(this.opts.oauth_nonce || Math.floor(Math.random()*1111111111))+'",' +
   'oauth_verifier="'+this.opts.oauth_verifier+'",' +
   'oauth_signature="'+this.opts.oauth_signature+'%26'+this.opts.oauth_token_secret+'"';
}
Yammer.prototype.request = function (uri, opts, cb) {
  var args = initParams(uri, opts, cb);

  // console.log(args);
  uri = args.uri;
  opts = args.options;
  cb = args.callback;

  // Remove this ambiguity around which uri is the right one
  opts.uri = null;
  opts.url = null;

  var auth = this._oauth();

  if (uri[uri.length - 1] === '.') {
    uri += (this.opts.format || 'json');
  }
  
  if (!opts.headers) { opts.headers = {}; }
  if (auth) {
    opts.headers.authorization = auth;
  }

  request(uri, opts, function (e, resp, body) {
    if (e) { return cb(e); }
    if (resp.statusCode > 399) {
      return cb(new Error('Error status '+resp.statusCode+'\n'), body, resp);
    }
    if (resp.headers['content-type'].slice(0, 'application/json'.length) === 'application/json') {
      cb(null, JSON.parse(body), resp);
    } else {
      cb(null, body, resp);
    }
  });
}
Yammer.prototype._formpost = function (url, data, cb) {
  this.request({uri:url, method:'POST', headers:{'content-type':'application/x-www-form-urlencoded'}, body:qs.stringify(data)}, cb)
}
Yammer.prototype._post = function (url, data, cb) {
  this.request({uri:url, method:'POST', body:JSON.stringify(data), headers:{'content-type':'application/json'}}, cb)
}
Yammer.prototype._boolCb = function(uri, opts, cb) {
  var ret = {}
    , args = initParams(uri, opts, cb);

  cb = args.callback;

  return {
    uri: args.uri
    , options: args.opts
    , callback: function boolCallback(e, body, resp) {
      if (resp.statusCode === 404) {
        return cb(null, false);
      } 
      if (e) { return cb(e, body); }

      return cb(null, body);
    }
  }
}
Yammer.prototype.messages = function (opts, cb) {
  this.request(this.opts.hostname + '/api/v1/messages.', opts, cb);
}
Yammer.prototype.messagesSent = function (opts, cb) {
  this.request(this.opts.hostname + '/api/v1/messages/sent.', opts, cb);
}
Yammer.prototype.messagesReceived = function (opts, cb) {
  this.request(this.opts.hostname + '/api/v1/messages/received.', opts, cb);
}
Yammer.prototype.messagesFollowing = function (opts, cb) {
  this.request(this.opts.hostname + '/api/v1/messages/following.', opts, cb);
}
Yammer.prototype.messagesFromUser = function (userid, opts, cb) {
  this.request(this.opts.hostname + '/api/v1/messages/from_user/'+userid+'.', opts, cb);
}
Yammer.prototype.messagesFromBot = function (botid, opts, cb) {
  this.request(this.opts.hostname + '/api/v1/messages/bot_user/'+botid+'.', opts, cb);
}
Yammer.prototype.messagesWithTag = function (tagid, opts, cb) {
  this.request(this.opts.hostname + '/api/v1/messages/tagged_with/'+tagid+'.', opts, cb);
}
Yammer.prototype.messagesInGroup = function (groupid, opts, cb) {
  this.request(this.opts.hostname + '/api/v1/messages/in_group/'+groupid+'.', opts, cb);
}
Yammer.prototype.messagesFavoritesOf = function (userid, opts, cb) {
  this.request(this.opts.hostname + '/api/v1/messages/favorites_of/'+userid+'.', opts, cb);
}
Yammer.prototype.messagesLikedBy = function (userid, opts, cb) {
  this.request(this.opts.hostname + '/api/v1/messages/liked_by/'+userid+'.', opts, cb);
}
Yammer.prototype.messagesInThread = function (threadid, opts, cb) {
  this.request(this.opts.hostname + '/api/v1/messages/in_thread/'+threadid+'.', opts, cb);
}
Yammer.prototype.messagesAboutTopic = function (id, opts, cb) {
  this.request(this.opts.hostname + '/api/v1/messages/about_topic/'+id+'.', opts, cb);
}
Yammer.prototype.messagesPrivate = function (opts, cb) {
  this.request(this.opts.hostname + '/api/v1/messages/private.', opts, cb);
}
Yammer.prototype.directMessages = Yammer.prototype.messagesPrivate;

Yammer.prototype.messagesInbox = function (opts, cb) {
  this.request(this.opts.hostname + '/api/v1/messages/inbox.', opts, cb);
}

Yammer.prototype.groups = function (opts, cb) {
  this.request(this.opts.hostname + '/api/v1/groups.', opts, cb);
}
Yammer.prototype.group = function (id, opts, cb) {
  this.request(this.opts.hostname + '/api/v1/groups/'+id+'.', opts, cb);
}

Yammer.prototype.topic = function (id, opts, cb) {
  this.request(this.opts.hostname + '/api/v1/topics/'+id+'.', opts, cb);
}

Yammer.prototype.users = function (opts, cb) {
  this.request(this.opts.hostname + '/api/v1/users.', opts, cb);
}
Yammer.prototype.user = function (id, opts, cb) {
  this.request(this.opts.hostname + '/api/v1/users/'+id+'.', opts, cb);
}
Yammer.prototype.userByEmail = function (email, opts, cb) {
  this.request(this.opts.hostname + '/api/v1/users/by_email.json?email='+encodeURIComponent(email), opts, cb);
}

Yammer.prototype.relationships = function (opts, cb) {
  this.request(this.opts.hostname + '/api/v1/relationships.', opts, cb);
}

Yammer.prototype.suggestions = function (opts, cb) {
  this.request(this.opts.hostname + '/api/v1/suggestions.', opts, cb);
}
Yammer.prototype.suggestedUsers = function (opts, cb) {
  this.request(this.opts.hostname + '/api/v1/suggestions/users.', opts, cb);
}

Yammer.prototype.thread = function (id, opts, cb) {
  this.request(this.opts.hostname + '/api/v1/threads/'+id+'.', opts, cb);
}


Yammer.prototype.checkUserSubscription = function (userid, opts, cb) {
  var args = this._boolCb(this.opts.hostname + '/api/v1/subscriptions/to_user/'+userid+'.'
    , opts, cb);
  this.request(args.uri, args.options, args.callback);
}
Yammer.prototype.checkTagSubscription = function (tagid, opts, cb) {
  var args = this._boolCb(this.opts.hostname + '/api/v1/subscriptions/to_tag/'+tagid+'.'
    , opts, cb);
  this.request(args.uri, args.options, args.callback);
}
Yammer.prototype.checkThreadSubscription = function (threadid, opts, cb) {
  var args = this._boolCb(this.opts.hostname + '/api/v1/subscriptions/to_thread/'+threadid+'.'
    , opts, cb);
  this.request(args.uri, args.options, args.callback);
}
Yammer.prototype.checkTopicSubscription = function (topicid, opts, cb) {
  var args = this._boolCb(this.opts.hostname + '/api/v1/subscriptions/to_topic/'+topicid+'.'
    , opts, cb);
  this.request(args.uri, args.options, args.callback);
}

Yammer.prototype.search = function (term, opts, cb) {
  this.request(this.opts.hostname + '/api/v1/search.json?search='+term, opts, cb);
}

Yammer.prototype.networks = function (opts, cb) {
  this.request(this.opts.hostname + '/api/v1/networks/current.', opts, cb);
}

Yammer.prototype.invite = function (email, opts, cb) {
  this._post(this.opts.hostname + '/api/v1/invitations.', {email:email}, opts, cb);
}
Yammer.prototype.createMessage = function (obj, opts, cb) {
  this._formpost(this.opts.hostname + '/api/v1/messages.json', obj, opts, cb);
}
Yammer.prototype.likeMessage = function(obj, opts, cb) {
  this._formpost(this.opts.hostname + '/api/v1/messages/liked_by', obj, opts, cb);
}

Yammer.prototype.presences = function (opts, cb) {
  this.request(this.opts.hostname + '/api/v1/presences.', opts, cb);
}
Yammer.prototype.presencesByFollowing = function (opts, cb) {
  this.request(this.opts.hostname + '/api/v1/presences/by_following.', opts, cb);
}

Yammer.prototype.tokens = function (opts, cb) {
  this.request(this.opts.hostname + '/api/v1/oauth/tokens.', opts, cb)
}

exports.Yammer = Yammer;
exports.initParams = initParams;
