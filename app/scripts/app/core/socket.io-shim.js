define([

],

function () {
  'use strict';

  var _initialized = false;
  var io = window.io;
  // window.io = null;
  console.log('TODO: Set window.io to null');

  var socket = io.connect('http://localhost:9000');
  window.socket = socket;
  console.log('TODO: Unset window.socket');

  socket.on('error', function (reason){
    console.error('Unable to connect Socket.IO', reason);
  });

  socket.on('connect', function (){
    console.info('successfully established a working connection \\o/');
  });

  socket.on('disconnect', function(){
    console.log('SOCKET.IO -- DISCONNECTED');
  });

  socket.on('reconnect', function () {
    // pull all models/collections from the server that are currently in app.collections and app.models
    // socket.emit('fullMonty', { contexts: [openContexts] });
    console.log('SOCKET.IO -- RECONNECTING');
  });

  return {
    socket: socket,
    init: function (app) {
      if (!app) {
        return;
      }

      if (_initialized) {
        return socket;
      }

      socket.on('fullMonty', function (data) {
        app.collections.contexts.set(data.contexts);
        app.collections.projects.set(data.projects);
        app.collections.tasks.set(data.tasks);
        app.user.set(data.user);
      });

      socket.on('user', function (user) {
        console.log('receiving user', user);
        // socket.emit('my other event', { my: 'data' });
      });
      socket.on('isay', function (data) {
        console.log('isay', data);
      });

      _initialized = true;
      return socket;
    },
  };
});
