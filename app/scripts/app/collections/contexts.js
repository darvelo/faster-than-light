define([
  'backbone',
  'models/context',
],

function (Backbone, Context) {
  'use strict';

  var Contexts = Backbone.Collection.extend({
    model: Context,
    url: '/api/contexts',
    comparatorItem: 'order',

    resort: function () {
      var lastIndex,
          comparatorItem = this.comparatorItem;

      this.each(function (model) {
        var currIndex = model.get(comparatorItem);

        if (lastIndex === currIndex) {
          model.set(comparatorItem, currIndex + 1);
          currIndex++;
        }

        lastIndex = currIndex;
      }, this);
    },
    comparator: function (model1, model2) {
      var comparatorItem = this.comparatorItem,
          firstOrder = model1.get(comparatorItem),
          secondOrder = model2.get(comparatorItem);

      if (firstOrder > secondOrder) {
        // first is larger
        return 1;
      } else if (firstOrder < secondOrder) {
        // first is smaller
        return -1;
      } else {
        // they're equal, new one is first
        return 1;
      }
    },
  });

  return Contexts;
});
