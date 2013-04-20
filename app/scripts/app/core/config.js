define([
  'backbone',
],

function (Backbone) {
  'use strict';

  // Backbone.sync = function(method, model, options) {
  //   options || (options = {});

  //   switch (method) {
  //     case 'create':
  //     break;

  //     case 'update':
  //     break;

  //     case 'delete':
  //     break;

  //     case 'read':
  //     break;
  //   }
  // };

  return {
    paneOrder: ['center', 'south', 'west', 'north', 'east'],
    replacementPaneOrder: ['east', 'west', 'north', 'south'],
  };
});
