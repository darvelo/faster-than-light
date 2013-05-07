require.config({
  paths: {
    jquery: '../../components/jquery/jquery',
    jqueryui: '../../components/jquery-ui-custom/jquery-ui-1.10.2.custom',
    'jqueryui-layout': '../../components/jquery-ui-layout/jquery.layout-latest',
    handlebars: '../../components/handlebars/handlebars.runtime',
    JST: 'templates',
    underscore: '../../components/underscore/underscore',
    backbone: '../../components/backbone/backbone',
    'socket.io': 'core/socket.io-shim',
    bootstrap: '../vendor/bootstrap',
    validator: '../vendor/validator',
  },
  shim: {
    'socket-io': {
      exports: 'io',
    },
    jqueryui: {
      deps: [
        'jquery',
      ],
    },
    'jqueryui-layout': {
      deps: [
        'jquery',
        'jqueryui',
      ],
    },
    handlebars: {
      deps: [],
      exports: 'Handlebars'
    },
    underscore: {
      deps: [],
      exports: '_'
    },
    backbone: {
      deps: ['jquery', 'underscore'],
      exports: 'Backbone'
    },
    bootstrap: {
      deps: ['jquery'],
      exports: 'jquery'
    }
  }
});

require(['app', 'socket.io'], function (App, io) {
  'use strict';

  console.log('io', io);
  window.app = new App();
  // window.io = io;

  window.socket = io.connect('http://localhost:9000');
  socket.on('news', function (data) {
    console.log(data);
    socket.emit('my other event', { my: 'data' });
  });
  socket.on('yoyo', function (data) {
    console.log(data);
  });

});

