define([
  'jquery',
  'underscore',
],

function ($, _) {
  'use strict';

  function deleteUserProps (userJSON) {
    userJSON = _.cloneDeep(userJSON);

    delete userJSON.lastContexts;
    delete userJSON.paneSizes;
    delete userJSON.menu;

    return userJSON;
  }

  return {
    deleteUserProps: deleteUserProps,
  };
});
