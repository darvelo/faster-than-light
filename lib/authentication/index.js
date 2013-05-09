'use strict';

var crypto = require('crypto'),
    SALT_SIZE = 256/8, // must be larger than 128 bits
    PKBDF2_ITERATIONS = 128000, //  recommended in the RSA PKCS5 standard in 2000, a value that should be doubled every 2 years. Therefore, in 2012, it is recommended that 64,000 iterations be considered.
    KEY_SIZE = 64; // final derived key size

var e; //used for app.errors
var app; // placeholder for app instance defined in exports.use()
exports.use = function (appInstance) {
  app = appInstance;
  e = app.errors;
};

exports.hashPassword = function(password, cb) {
  crypto.randomBytes(SALT_SIZE, function(err, buf) {
    if (err) {
      return cb(err);
    }

    var salt = new Buffer(buf, 'binary').toString('base64');
    crypto.pbkdf2(password, salt, PKBDF2_ITERATIONS, KEY_SIZE, function(err, derivedKey) {
      if (err) {
        return cb(err);
      }

      var key = new Buffer(derivedKey, 'binary').toString('base64'); // derivedKey is a Buffer

      cb(null, salt, key);
    });
  });
};

exports.checkPassword = function(password, salt, storedKey, cb) {
  crypto.pbkdf2(password, salt, PKBDF2_ITERATIONS, KEY_SIZE, function(err, derivedKey) {
    if (err) {
      return cb(err);
    }

    var key = new Buffer(derivedKey, 'binary').toString('base64'); // derivedKey is a Buffer

    cb(null, key === storedKey);
  });
};

exports.checkCredentials = function(req, res, next) {
  // var key = req.query['api-key'];

  // // key isnt present
  // if (!key) return next(error(400, 'api key required'));

  // // key is invalid
  // if (!~apiKeys.indexOf(key)) return next(error(401, 'invalid api key'));

  // // all good, store req.key for route access
  // req.key = key;
  // next();

  if (req.apiKey) {
    // do api token checking
    return next(); // if successful. return next(err) if unsuccessful
  }

  if (req.headers['x-csrf-token'] && req.headers['x-csrf-token'] === res.locals.token) {
    // sessions are available
    console.log('checking api credentials.. OK!');
    return next();
  }

  var err = new e.ApiError('Insufficient API Credentials');
  err.status = 403;

  return next(err);
};
