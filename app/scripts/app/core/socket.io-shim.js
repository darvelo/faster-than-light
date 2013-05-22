define([
  'core/util',
  'underscore',
],

function (util, _) {
  'use strict';

  var _initialized = false;
  var io = window.io;
  // window.io = null;
  console.log('TODO: Set window.io to null');

  var socket = io.connect('http://localhost:9000');
  window.socket = socket;
  console.log('TODO: Unset window.socket');

  return {
    init: function (app) {
      if (_initialized) {
        return socket;
      }

      socket.on('error', function (reason){
        console.error('Unable to connect Socket.IO', reason);
      });

      socket.on('connect', function (){
        console.info('successfully established a working connection \\o/');
      });

      socket.on('disconnect', function(){
        // show some kind of error and halt all app activity
        // maybe like app.navi
        console.log('SOCKET.IO -- DISCONNECTED');
      });



      socket.on('reconnect', function () {
        // pull all models/collections from the server that are currently in app.collections and app.models
        // socket.emit('fullMonty', { contexts: [openContexts] });
        console.log('SOCKET.IO -- RECONNECTED');
        var lastContexts = _.values(app.user.get('lastContexts'));

        if (_.isEmpty(lastContexts)) {
          console.log('lastcontexts empty');
          return app.data.empty();
        }

        socket.emit('fullMonty', lastContexts);
      });
      socket.on('dataChange', function () {
        console.log('socket.io says there was a data change. asking for lastContexts fullMonty');
        var lastContexts = _.values(app.user.get('lastContexts'));

        if (_.isEmpty(lastContexts)) {
          return app.data.empty();
        }

        socket.emit('fullMonty', lastContexts);
      });

      /*
       * fullMonty Events
       */
      socket.on('fullMontyError', function (err) {
        console.log('socket.io fullMonty Error!');
        // err.message might be useful
        // do something with an error modal that'll kick it off again
      });
      socket.on('fullMonty', function (data) {
        console.log('receiving fullMonty', data);
        app.data.empty();
      });

      socket.on('getUser', function (user) {
        console.log('receiving user', user);
        // remove properties of visual settings that
        // may have been set by another client
        user = util.deleteUserProps(user);
        app.user.set(user);
      });

      socket.on('getUserError', function (err) {
        console.log('socket.io getUser Error!');
        // err.message might be useful
        // do something with an error modal that'll kick it off again
      });

      socket.on('userChange', function () {
        console.log('socket.io says there was a user data change. asking for latest user data');
        socket.emit('getUser');
      });


      _initialized = true;
      return socket;
    },
  };
});
