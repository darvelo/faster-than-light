'use strict';

var mongoose = require('mongoose');
var textSearch = require('mongoose-text-search');
var async = require('async');
var inspect = require('util').inspect;

//var db = mongoose.createConnection('localhost', 'test');
//mongoose.connect('localhost', 'gettingstarted');
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function dbReady () {

// });
var db = mongoose.connect('mongodb://localhost/test');

// create our Models
var User = require('./models/user.js')(mongoose);
var Context = require('./models/context.js')(mongoose);
//var Task = require('./models/task.js')(mongoose, textSearch);


// seed database
function seedUser (cb) {
  var dave = new User({ username: 'dave' });

  console.log(db);
  console.log(dave);

  dave.save(function (err, dave) {
    if (err) {
      console.log(err);
    }

    console.log('message');
    console.log(dave.toJSON());
    console.log(inspect(dave, { depth: null }));

    cb(err, dave.id);
  });
}

function seedContexts (userId, cb) {
  var context1 = new Context({
    userId: userId,
    projects: [],
    order: 1,
    title: 'First Context',
    description: 'This is my first one!! Woohoo!',
  });

  var context2 = new Context({
    userId: userId,
    projects: [],
    order: 2,
    title: 'Second Context',
    description: 'This is my second one! Woohoo!',
  });

  var context3 = new Context({
    userId: userId,
    projects: [],
    order: 3,
    title: 'Third Context',
    description: 'This is my third one. Woohoo.',
  });

  async.parallel([
    function(callback) {
      context1.save(callback);
    },
    function(callback) {
      context2.save(callback);
    },
    function(callback) {
      context3.save(callback);
    }
  ],
  function(err, results) {
    // any other processing that needs to be done here?
    cb(err, results);
  });
}

exports.seed = function (req, res, next) {
  async.waterfall([
    seedUser,
    seedContexts,
    function (err, results) {
      if (err) {
         next(err);
      } else {
        res.send(results);
      }
    },
  ],

  function(err, results) {
    res.send(err || results);
  });
};

exports.getContexts = function (cb) {
  Context.find(function (err, results) {
    //console.log(results);

    var finalObject = [];

    results.forEach(function(obj) {
      console.log(obj.toObject());
      finalObject.push(JSON.stringify(obj));
    });

    console.log(finalObject)

    cb(err, finalObject);
  });
};

/* test out text search */
/*
  // modules
  var mongoose = require('mongoose');
  var textSearch = require('mongoose-text-search');

  // create our schema
  var gameSchema = mongoose.Schema({
      name: String
    , tags: [String]
    , likes: Number
    , created: Date
  });

  // give our schema text search capabilities
  gameSchema.plugin(textSearch);

  // add a text index to the tags array
  gameSchema.index({ tags: 'text' });

  // test it out
  var Game = mongoose.model('Game', gameSchema);

  Game.create({ name: 'Super Mario 64', tags: ['nintendo', 'mario', '3d'] }, function (err) {
    if (err) return handleError(err);

    Game.textSearch('3d', function (err, output) {
      if (err) return handleError(err);

      var inspect = require('util').inspect;
      console.log(inspect(output, { depth: null }));

      // { queryDebugString: '3d||||||',
      //   language: 'english',
      //   results:
      //    [ { score: 1,
      //        obj:
      //         { name: 'Super Mario 64',
      //           _id: 5150993001900a0000000001,
      //           __v: 0,
      //           tags: [ 'nintendo', 'mario', '3d' ] } } ],
      //   stats:
      //    { nscanned: 1,
      //      nscannedObjects: 0,
      //      n: 1,
      //      nfound: 1,
      //      timeMicros: 77 },
      //   ok: 1 }
    });
  });
*/
