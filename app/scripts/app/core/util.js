define([
  'underscore',
],

function (_) {
  'use strict';

  function deleteUserProps (userJSON) {
    delete userJSON.lastContexts;
    delete userJSON.paneSizes;
    delete userJSON.menu;
  }

  return {
    deleteUserProps: deleteUserProps,
  };
});
