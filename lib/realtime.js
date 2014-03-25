var request = require('request');

function RealTime (yam) {
  this.yam = yam;
}

module.exports = RealTime;

RealTime.prototype.messages = function (cb) {
  this.yam.messages.all(function (e, body) {
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
};
