define([
  'jquery',
  'jqueryui-layout',
],

function ($, $ui) {
  'use strict';

  return function retOptions (paneSelector, westSelector, centerSelector) {
    return {
      name: 'todosLayout' // NO FUNCTIONAL USE, but could be used by custom code to 'identify' a layout
      // options.defaults apply to ALL PANES - but overridden by pane-specific settings
      , panes: {
        size:         'auto'
        ,   resizerDblClickToggle:   false        // true = double-clicking anywhere on the resizer-bar will toggle the pane open/closed
        ,   autoResize:              true        // IF size is 'auto' or a percentage, then recalc 'pixel size' whenever the layout resizes
        ,   autoReopen:              true        // IF a pane was auto-closed due to noRoom, reopen it when there is room? False = leave it closed
        , minSize:        50
        , paneClass:        paneSelector    // default = 'ui-layout-pane'
        , resizerClass:     paneSelector + '-resizer' // default = 'ui-layout-resizer'
        , togglerClass:     paneSelector + '-toggler' // default = 'ui-layout-toggler'
        , buttonClass:      paneSelector + '-button'  // default = 'ui-layout-button'
        , contentSelector:    '.content'  // inner div to auto-size so only it scrolls, not the entire pane!
        , contentIgnoreSelector:  'span'    // 'paneSelector' for content to 'ignore' when measuring room for content
        , togglerLength_open:   0 // no toggler button available on divider
        , hideTogglerOnSlide:   true    // hide the toggler when pane is 'slid open'
        , resizerTip:       'Resize This Pane'
        //  effect defaults - overridden on some panes
        , slidable:       false   // REFERENCE - cannot slide if spacing_closed = 0
        , resizable:        true
        , tips: {
            Open:           'Open'    // eg: 'Open Pane'
          , Close:          'Close'
          , Resize:         'Resize'
          , Slide:          'Slide Open'
          , Pin:            'Pin'
          , Unpin:          'Un-Pin'
          , noRoomToOpen:   'Not enough room to show this panel.' // blank = no message
          , minSizeWarning: 'Panel has reached its minimum size'  // statusbar message
          , maxSizeWarning: 'Panel has reached its maximum size'  // ditto
          }
        , errors: {
            pane:               'pane'      // 'layout pane element' - used only in error messages
          , selector:           'selector'  // 'jQuery-selector' - used only in error messages
          , addButtonError:     'Error Adding Button \n\nInvalid '
          , containerMissing:   'UI Layout Initialization Error\n\nThe specified layout-container does not exist.'
          , centerPaneMissing:  'UI Layout Initialization Error\n\nThe center-pane element does not exist.\n\nThe center-pane is a required element.'
          , noContainerHeight:  'UI Layout Initialization Warning\n\nThe layout-container "CONTAINER" has no height.\n\nTherefore the layout is 0-height and hence "invisible"!'
          , callbackError:      'UI Layout Callback Error\n\nThe EVENT callback is not a valid function.'
          }
        }
      , west: {
          size:         250
        , initClosed: false
        , togglerLength_open:   60     // NONE - using custom togglers INSIDE west-pane
        , resizerTip_open:    'Resize West Pane'
        , paneSelector:           westSelector// '.ui-layout-north'
        , resizerCursor:           'w-resize'  // custom = url(myCursor.cur)
        , onclose_end: function (paneType, $el, state, options, layoutName) {
            var closeEvent = $.Event("paneClose");
            $el.trigger(closeEvent, [paneType]);
            return false; // prevents error from occurring because the $el is removed in the app code during trigger
          }
        , onresize: function (paneType, $el, state, options, layoutName) {
            var resizeEvent = $.Event("paneResize");
            $el.trigger(resizeEvent, [paneType, 'outer', state.size]);
          }
        }
      , center: {
          paneSelector:     centerSelector //'#mainContent'      // sample: use an ID to select pane instead of a class
        , minWidth:       200
        , minHeight:        200
        // ,   children: {
        //     ,   name: 'page-north'
        //     ,   panes: {
        //         ,   north: {

        //             }
        //         }
        //     }
        }
      , north: {
        }
      , south: {
        }
      , east: {
        }
    };
  }
});
