define(function (require) {
  var _ = require('underscore');
  var Backbone = require('backbone');
  var B = require('bluebird');
  var Super = Backbone.Model;
  var View = require('views/view');
  var App = Super.extend({});

  App.prototype.initialize = function () {
    Super.prototype.initialize.apply(this, arguments);
  };

  App.prototype.run = function () {
    var view = new View();
    view.render();
  };

  return App;
});