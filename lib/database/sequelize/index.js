var sequelizeConfig = require('./sequelize.json'),
    Sequelize = require('sequelize');

var sequelize = new Sequelize(sequelizeConfig.database, sequelizeConfig.username, sequelizeConfig.password, {
  host: sequelizeConfig.host,
  port: sequelizeConfig.port,
  dialect: 'mysql' // change to 'mysql' if you're using mysql
  // dialect: 'sqlite', // change to 'mysql' if you're using mysql
  // storage: './db.sqlite' // can change to ':memory:' if disposable
});

var Tables = {};
var Context = Tables.Context = sequelize.import(__dirname + '/models/context.js');

sequelize.sync().success(function() {

}).error(function(err) {
  console.error(err);
});


// var conext = Tables.Context.build({
//   title: 'Work',
//   order: 0,
//   isPublic: 1,
// //  date: '2013-04-21 00:33:22' //(new Date("Sat Apr 20 2013 20:33:22 GMT-0400 (EDT)")).toISOString()
// });

// var conext2 = Tables.Context.build({
//   title: 'School',
//   order: 1,
//   isPublic: 1,
// //  date: '2013-04-21 00:33:22' //(new Date("Sat Apr 20 2013 20:33:22 GMT-0400 (EDT)")).toISOString()
// });

// //Tables.Context.sync().success(function() { console.log('success!')});
// conext.save()
//   .success(function () { console.log ('success!'); })
//   .error(function(err) { console.log ('error!', err); });
// conext2.save()
//   .success(function () { console.log ('success!'); })
//   .error(function(err) { console.log ('error!', err); });



exports.getContexts = function(fn) {
  // sequelize.query("SELECT * FROM Tasks").success(function (tasks) {
  //   console.log(tasks[0].date)
  //   console.log(tasks[0].date instanceof Date)
  //   console.log(typeof tasks[0].date)
  // });



  Context.findAll()
    .success(function(contexts) {
      fn(null, contexts);
    });
};
