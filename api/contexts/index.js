'use strict';

var  async = require('async');

var app; // placeholder for app instance defined in exports.use()
exports.use = function (appInstance) {
  app = appInstance;
};

exports.getAll = function(req, res, next) {
  app.db.getContexts(function(err, contexts) {
    if (err) {
      return next(err);
    }

    // TODO: Validate JSON
    res.send(JSON.stringify(contexts));
  });
};

exports.postContext = function (req, res, next) {
  req.assert('siteCode', 'Required').notEmpty();
  req.assert('siteCode', 'Must only contain alphanumeric characters').isAlphanumeric();

  var errors = req.validationErrors();
  if (errors) {
    res.send(400, 'There were validation errors: ' + util.inspect(errors));
    return;
  }

  // Trim off any leading / trailing whitespace
  req.sanitize('siteCode').trim();

};
