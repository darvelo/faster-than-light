define([
  'jquery',
  'jqueryui-layout',
],

function ($, $ui) {
  'use strict';

  return function retOptions (paneClass, ignoreSelector) {
    return {
      name: 'contextsLayout' // NO FUNCTIONAL USE, but could be used by custom code to 'identify' a layout
      , minSize:            10 // TESTING ONLY
      , fxSettings: { }
      , fxName_open: "none"
      , fxSpeed_open:         0
      , fxName_close: "drop"
      , fxSpeed_close:          500
      , fxSettings_close:       { easing: "easeOutQuint" }
      , showErrorMessages: false
      , panes: {
          paneClass:        paneClass //'pane'    // default = 'ui-layout-pane'
        , resizerClass:     paneClass + '-resizer' // default = 'ui-layout-resizer'
        , togglerClass:     paneClass + '-toggler' // default = 'ui-layout-toggler'
        , buttonClass:      paneClass + '-button'  // default = 'ui-layout-button'
        // , contentSelector:    ".projects"  // inner div to auto-size so only it scrolls, not the entire pane!
        , contentIgnoreSelector: ignoreSelector
        , spacing_closed:         0          // ditto - when pane is 'closed'
        , spacing_open:            6           // space between pane and adjacent panes - when pane is 'open'
        , slidable:       false   // REFERENCE - cannot slide if spacing_closed = 0
        , hideTogglerOnSlide:      true       // when pane is slid-open, should the toggler show?

        , togglerLength_open:   0      // WIDTH of toggler on north/south edges - HEIGHT on east/west edges
        , resizerDblClickToggle:   false        // true = double-clicking anywhere on the resizer-bar will toggle the pane open/closed
        , autoResize:              true        // IF size is 'auto' or a percentage, then recalc 'pixel size' whenever the layout resizes
        , autoReopen:              true        // IF a pane was auto-closed due to noRoom, reopen it when there is room? False = leave it closed
        , initClosed:           true
/*        , onclose_end: function (paneType, $el, state, options, layoutName) {
            var closeEvent = $.Event("paneClose");
            $el.trigger(closeEvent, [paneType]);
            return false; // prevents error from occurring because the $el is removed in the app code during trigger
          }
*/
          , onresize: function (paneType, $el, state, options, layoutName) {
            var resizeEvent = $.Event("paneResize");
            $el.trigger(resizeEvent, [paneType, 'inner', state.size]);
          }

      }
      , north: {
        paneSelector: '.' + paneClass + '-north'
      }
      , south: {
        paneSelector: '.' + paneClass + '-south'
      }
      , center: {
           minWidth:       10
        ,  minHeight:        10
        ,  paneSelector: '.' + paneClass + '-center'
      }
      , west: {
        paneSelector: '.' + paneClass + '-west'
      }
      , east: {
        paneSelector: '.' + paneClass + '-east'
      }
    };
  };
});
