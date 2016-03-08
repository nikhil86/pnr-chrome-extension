define(function (require) {
  var _ = require('underscore');
  var Backbone = require('backbone');
  var B = require('bluebird');
  var Super = Backbone.Model;
  var PNR = require('models/pnr')
  var App = Super.extend({});

    App.prototype.initialize = function () {
      Super.prototype.initialize.apply(this, arguments);
    };

    App.prototype.run = function () {
      chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
          var response;
          switch (request.msg) {
            case 'store_front_defaults':
              response = PNR.getInstance().getDefaultStoreFrontValues(request.value);
              sendResponse(response);
              break;
            case 'get_pnr':
              PNR.getInstance().getPNR(request.value)
                .then(function (response) {
                  sendResponse(response);
                }).catch(function () {
                  sendResponse({status: 400});
                });
              return true;
            default:
              response = {status: 400};
              break;
          }
        });
    };

    return App;
});