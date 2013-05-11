'use strict';

var passportSocketIo = require('./io-passport');

exports.configure = function (app, io) {
  io.configure(function () {
    io.set('authorization', passportSocketIo.authorize({
      key:    app.sessionKey,       //the cookie where express (or connect) stores its session id.
      secret: app.sessionSecret, //the session secret to parse the cookie
      store:   app.sessionStore,     //the session store that express uses
      fail: function(data, accept) {     // *optional* callbacks on success or fail
        accept(null, false);             // second param takes boolean on whether or not to allow handshake
      },
      success: function(data, accept) {
        accept(null, true);
      }
    }));

    if (app.get('env') === 'production') {
      // socket.io production settings
      // recommended from: https://github.com/LearnBoost/Socket.IO/wiki/Configuring-Socket.IO
      io.enable('browser client minification');  // send minified client
      io.enable('browser client etag');          // apply etag caching logic based on version number
      io.enable('browser client gzip');          // gzip the file
      io.set('log level', 1);                    // reduce logging

      // enable all transports (optional if you want flashsocket support, please note that some hosting
      // providers do not allow you to create servers that listen on a port different than 80 or their
      // default port)
      io.set('transports', [
        'websocket',
        'flashsocket',
        'htmlfile',
        'xhr-polling',
        'jsonp-polling',
      ]);
    }
  });
};
