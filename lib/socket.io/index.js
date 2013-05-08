'use strict';

var app, server, io; // set in module.exports
var ioPassport = require('./io-passport');



/*
io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
  socket.on('yaya', function (data) {
    socket.emit('yoyo', { yoyo: 'son' });
  });
});
*/

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

function doinMaThang (user) { console.log('JES DOIN\' MA THANG', user); }

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

module.exports = function (appInstance) {
  app = appInstance;
  server = require('http').createServer(app);
  io = require('socket.io').listen(server);
  ioPassport.configure(app, io);
  // ioMethods.use(io);

  return {
    server: server,
    filterSocketsByUser: filterSocketsByUser,
    doinMaThang: doinMaThang,
  };
};
