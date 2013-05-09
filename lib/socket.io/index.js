'use strict';

var app, server, io; // set in module.exports
var ioPassport = require('./io-passport');





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

function broadcastUser (sessID, user, userModel) {
  io.sockets.in(user.id).emit('user', userModel);


  console.log('broadcasting');
  io.sockets.clients(user.id).forEach(function (socket) {
    console.log(socket.handshake.sessionID)
  });
}

module.exports = function (appInstance) {
  app = appInstance;
  server = require('http').createServer(app);
  io = require('socket.io').listen(server);
  ioPassport.configure(app, io);


  io.sockets.on('connection', function (socket) {
    var userId = socket.handshake.user.id;

    // join a room specifically for sessions with this userid.
    // this will make it easier to send messages or updates to
    // other connected clients when a user makes a change on one client.
    socket.join(socket.handshake.user.id);

    socket.on('backboneREST', function (data) {
      console.log('Backbone REST Call: ', data.method, data.url);

      if (/^\/api\/user/.test(data.url)) {
        socket.broadcast.to(userId).emit('userChange', data);
      } else {
        socket.broadcastto(userId).emit('dataChange', data);
      }
    });
  });


  return {
    server: server,
    filterSocketsByUser: filterSocketsByUser,
    broadcastUser: broadcastUser,
  };
};
