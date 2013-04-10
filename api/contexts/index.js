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

  // var context = req.body;

  // app.db.postContext(context, function (err, context) {

  // });

  // Tank.findById(id, function (err, tank) {
  //   if (err) return handleError(err);

  //   tank.size = 'large';
  //   tank.save(function (err) {
  //     if (err) return handleError(err);
  //     res.send(tank);
  //   });
  // });

  // OR , to update the document without Monogoose validation on save()
  //      (meaning the validation occurs on the POSTed object beforehand):
  //
  // // this will return the document for any other processing
  // Tank.findByIdAndUpdate(id, { $set: { size: 'large' }}, function (err, tank) {
  //   if (err) return handleError(err);
  //   res.send(tank);
  // });
  //
  // // this updates the document without returning it
  // Tank.update({ _id: id }, { $set: { size: 'large' }}, callback);
  // // The callback function receives (err, numberAffected, rawResponse).
  // //   * err is the error if any occurred
  // //   * numberAffected is the count of updated documents Mongo reported
  // //   * rawResponse is the full response from Mongo


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
