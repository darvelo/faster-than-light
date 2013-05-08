// This code is borrowed/modified from:
// https://github.com/jfromaniello/passport.socketio

var connectUtils = require('connect').utils,
    cookie = require('cookie'),
    xtend = require('underscore').extend;

function authorize(options) {
  var defaults = {
    passport: require('passport'),
    key: 'connect.sid',
    secret: null,
    store: null,
    success: null,
    fail: null
  };

  var auth = xtend({}, defaults, options );

  auth.userProperty = auth.passport._userProperty || 'user';

  return function(data, accept){
    if (!data.headers.cookie) {
      return accept(null, false);
    }

    var parsedCookie = cookie.parse(data.headers.cookie);

    data.cookie = connectUtils.parseSignedCookies(parsedCookie, auth.secret);

    data.sessionID = data.cookie[ auth.key ];

    auth.store.get(data.sessionID, function(err, session){
      if (err) {
        return accept('Error in session store.', false);
      } else if (!session) {
        return accept(null, false);
      }

      if( !session[ auth.passport._key ] ){
        return accept('passport was not initialized', false);
      }

      // disallow cross-domain socket connections
      if (data.xdomain) {
        return accept(null, false);
      }

      var userKey = session[ auth.passport._key ][ auth.userProperty ];

      if( !userKey && auth.fail ) {
        return auth.fail( data, accept );
      } else if( !userKey ) {
        return accept(null, false);
      }

      auth.passport.deserializeUser(userKey, function(err, user) {
        data[ auth.userProperty ] = user;
        if( auth.success ) {
          return auth.success( data, accept );
        }
        accept(null, true);
      });

    });
  };
}

exports.authorize = authorize;
