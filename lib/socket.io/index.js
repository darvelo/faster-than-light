'use strict';

var app, server, io; // set in module.exports
var ioConfigure = require('./io-configure');

/*
  io.sockets.on('connection', function(socket){
    console.log('user connected: ', socket.handshake.user.username);

    //filter sockets by user...
    var userGender = socket.handshake.user.gender,
        opposite = userGender === 'male' ? 'female' : 'male';

    passportSocketIo.filterSocketsByUser(io, function (user) {
      return user.gender === opposite;
    }).forEach(function(s){
      s.send('a ' + userGender + ' has arrived!');
    });
  });
*/


function filterSocketsByUser(filter){
  var handshaken = io.sockets.manager.handshaken;
  return Object.keys(handshaken || {})
    .filter(function(skey){
      return filter(handshaken[skey].user);
    })
    .map(function(skey){
      return io.sockets.manager.sockets.sockets[skey];
    });
}

function totalBroadcastUser (sessID, user, userModel) {
  io.sockets.in(user.id).emit('user', userModel);


  console.log('broadcasting');
  io.sockets.clients(user.id).forEach(function (socket) {
    console.log(socket.handshake.sessionID);
  });
}

module.exports = function (appInstance) {
  app = appInstance;
  server = require('http').createServer(app);
  io = require('socket.io').listen(server);
  ioConfigure.configure(app, io);


  io.sockets.on('connection', function (socket) {
    var userId = socket.handshake.user.id;

    // join a room specifically for sessions with this userid.
    // this will make it easier to send messages or updates to
    // other connected clients when a user makes a change on one client.
    socket.join(socket.handshake.user.id);

    socket.on('backboneREST', function (data) {
      console.log('Backbone REST Call: ', data.method, data.url);

      // maybe do something with app.routes here?

      if (/^\/api\/user/.test(data.url)) {
        socket.broadcast.to(userId).emit('userChange');
      } else {
        socket.broadcast.to(userId).emit('dataChange');
      }
    });

    socket.on('getUser', function () {
      app.db.users.getUserById(userId, function (err, user) {
        if (err) {
          return socket.emit('getUserError', {
            message: 'The server failed to get user data',
          });
        }

        socket.emit('getUser', user);
      });
    });

    socket.on('fullMonty', function (lastContexts) {
      app.db.batch.bootstrapByContexts(userId, lastContexts, function (err, fullMonty) {
        if (err) {
          return socket.emit('fullMontyError', {
            message: 'The server failed to get reset data',
          });
        }

        socket.emit('fullMonty', fullMonty);
      });
    });

  });

  // all of these are full broadcasts to all sockets.
  // this is because in these functions there is no handle to any individual socket.
  //
  // I may want to expose the socket itself in the future, but for now I think
  // encapsulating all socket.io processes in this library is cleaner.
  return {
    server: server,
    filterSocketsByUser: filterSocketsByUser,
    totalBroadcastUser: totalBroadcastUser,
  };
};
