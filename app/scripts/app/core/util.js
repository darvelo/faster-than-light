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

  // from: http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
  function isADomElementOrNode (obj) {
    //Returns true if it is a DOM node
    function isNode(o){
      return (
        typeof Node === 'object' ? o instanceof Node :
        o && typeof o === 'object' && typeof o.nodeType === 'number' && typeof o.nodeName==='string'
      );
    }

    //Returns true if it is a DOM element
    function isElement(o){
      return (
        typeof HTMLElement === 'object' ? o instanceof HTMLElement : //DOM2
        o && typeof o === 'object' && o !== null && o.nodeType === 1 && typeof o.nodeName==='string'
      );
    }

    return isNode(obj) || isElement(obj);
  }

  return {
    deleteUserProps: deleteUserProps,
    isAttachedToDOM: isAttachedToDOM,
    isADomElementOrNode: isADomElementOrNode,
  };

});
