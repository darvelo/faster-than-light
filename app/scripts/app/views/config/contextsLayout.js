define([
  'jqueryui-layout',
],

function ($) {
  'use strict';

  return {
     minSize:            20 // TESTING ONLY
    , fxSettings: { }
    , fxName_open: "none"
    , fxSpeed_open:         0
    , fxName_close: "drop"
    , fxSpeed_close:          500
    , fxSettings_close:       { easing: "easeOutQuint" }
    , showErrorMessages: false
    , panes: {
        slidable:       false   // REFERENCE - cannot slide if spacing_closed = 0
      ,   hideTogglerOnSlide:      true       // when pane is slid-open, should the toggler show?

      , togglerLength_open:   0      // WIDTH of toggler on north/south edges - HEIGHT on east/west edges
      , resizerDblClickToggle:   false        // true = double-clicking anywhere on the resizer-bar will toggle the pane open/closed
      , autoResize:              true        // IF size is 'auto' or a percentage, then recalc 'pixel size' whenever the layout resizes
      , autoReopen:              true        // IF a pane was auto-closed due to noRoom, reopen it when there is room? False = leave it closed
      , initClosed:           false
      , onhide: function (paneType, el, state, options, layoutName) { console.log('im hiding!', paneType, state.size) }
      , north: {
      }
      , south: {
      }
      , center: {
           minWidth:       200
        ,  minHeight:        200
      }
      , west: {
      }
      , east: {
      }
    }
  };
});
