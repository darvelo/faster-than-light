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
var Project = require('./models/project.js')(mongoose);
var Group = require('./models/group.js')(mongoose);
var Task = require('./models/task.js')(mongoose);
//var Task = require('./models/task.js')(mongoose, textSearch);


var seedDB = require('./seed');
seedDB.use(User, Context, Project, Group, Task);
seedDB.user('bob');
exports.seed = seedDB.seed;



exports.getContexts = function (cb) {
  Context.find(function (err, results) {
    //console.log(results);

    var finalObject = [];

    results.forEach(function(obj) {
      //console.log(obj.toObject());
      finalObject.push(obj.toObject());
    });

    console.log(finalObject);

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
