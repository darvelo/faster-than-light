'use strict';

var tests = Object.keys(window.__karma__.files).filter(function (file) {
  return /\.spec\.js$/.test(file);
});

require.config({
  // Karma serves files from '/base'
  baseUrl: '/base/app/scripts/app',

  paths: {
    json3: '../../components/json3/lib/json3',
    jquery: '../../components/jquery/jquery',
    jqueryui: '../../components/jquery-ui-custom/jquery-ui-1.10.2.custom',
    'jqueryui-layout': '../../components/jquery-ui-layout/jquery.layout-latest',
    // needed for precompiled templates
    handlebars: '../../components/handlebars/handlebars.runtime',
    JST: '../../../.tmp/scripts/app/templates',
    underscore: '../../components/lodash/dist/lodash.compat',
    backbone: '../../components/backbone/backbone',
    'socket.io': 'core/socket.io-shim',
    bootstrap: '../vendor/bootstrap',
    validator: '../vendor/validator',

    chai: '../../components/chai/chai',
    'sinon-chai': '../../components/sinon-chai/lib/sinon-chai',

    has: '../../components/has/has',
  },
  shim: {
    handlebars: {
      deps: [],
      exports: 'Handlebars',
    },
    underscore: {
      deps: [],
      exports: '_',
    },
    backbone: {
      deps: ['jquery', 'underscore'],
      exports: 'Backbone',
    },
    bootstrap: {
      deps: ['jquery'],
    },
  },
});

// workaround for Chai with PhantomJS:
// https://github.com/chaijs/chai/issues/107
var should;

require(['chai', 'sinon-chai', 'has'], function (chai, sinonChai, has) {
  window.chai = chai;
  chai.use(sinonChai);

  window.assert = chai.assert;
  window.expect = chai.expect;
  should = chai.should();

  window.has = has;

  require(tests, function () {
    window.__karma__.start();
  });
});
