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

  // this checks if the element is still attached to the DOM.
  // useful for promises on animations that may return after the element has been .detach()'d.
  function isAttachedToDOM (el) {
    // original code from:
    //   https://forum.jquery.com/topic/how-to-detect-if-a-node-is-attached-to-the-dom-using-a-reference-and-not-a-selector
    //
    // return $.contains(document.body, elem.jquery ? elem[0] : elem);

    return $.contains(document.body, el.jquery ? el[0] : el); // just in case :)
  }

  return {
    deleteUserProps: deleteUserProps,
    isAttachedToDOM: isAttachedToDOM
  };

});
