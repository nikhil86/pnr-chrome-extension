

define(function(require) {
  var _ = require('underscore');
  var $ = require('jquery');
  var Backbone = require('backbone');
  var B = require('bluebird');
  var TEMPLATE = require('text!./tpl/view.hbs');
  var SEGMENT_TEMPLATE = require('text!./tpl/segment.hbs');
  var PNR_TEMPLATE = require('text!./tpl/pnr.hbs');
  var mustache = require('mustache');
  var Bootstrap = require('bootstrap');
  var Super = Backbone.View;

  var ProjectListView = Super.extend({
    el: $('.container'),

    initialize: function () {
      Super.prototype.initialize.apply(this, arguments);
      this.counter = 1;
    },

    renderPNRInfo: function (data) {
      this.$el.find('.pnr').empty();
      var html = Mustache.to_html(PNR_TEMPLATE, {pnr: data.pnr, name: data.firstName + ' ' + data.lastName});
      this.$el.find('.pnr').append(html);
    },

    onSubmitClick: function (e) {
      e.preventDefault();
      var segments = this.getSegmentInformation();
      var pax = this.getPassengers();
      var me = this;
      var data = {
        segments: segments,
        pax: pax
      };
      $(e.currentTarget).find('i').toggle();
      this.sendMessageToBackground({
          msg: 'get_pnr',
          value: data
        })
        .then(function (res) {
          if(res.pnr) {
            return me.renderPNRInfo(res);
          }
          me.renderPNRInfo({pnr: 'Unknown', firstName: 'unknown', lastName: 'Unknown'});
        }).catch(function () {
          console.log('error');
        }).finally(function () {
          $(e.currentTarget).find('i').toggle();
        });
    },

    getPassengers: function () {
      var pax = [];
      _.each(this.$el.find('.pnr-details input[data-pax="TYPE"]'), function (input) {
        var count = parseInt($(input).val(), 10);
        _.each(_.range(count), function () {
          pax.push($(input).attr('id'));
        })
      });
      return pax;
    },

    getSegmentInformation: function () {
      var baseObj = {
        "todayPlus": 1,
        "airLine": this.$el.find('[data-attr="air-line"]').val(),
        "description": null,
        "id": 1
      };
      var segments = [];
      _.each(this.$el.find('.segment'), function (segment, index) {
        var obj = {};
        obj.id = index + 1;
        _.each($(segment).find('input'), function (input) {
          obj[$(input).data('attr')] = $(input).val();
        });
        segments.push(_.extend({}, baseObj, obj));
      });
      return segments;
    },

    onAddSegmentClick: function (e) {
      e.preventDefault();
      var html = Mustache.to_html(SEGMENT_TEMPLATE, {id: this.counter++});
      this.$el.find('.segments').append( html );
    },

    render: function () {
      var me = this;
      this.getStoreFrontDefaults()
        .then(function (res) {
          var html = Mustache.to_html(TEMPLATE, res);
          me.$el.find('.details').append( html );
          html = Mustache.to_html(SEGMENT_TEMPLATE, _.extend(res, {id: me.counter++}));
          me.$el.find('.segments').append( html );
          me.initializeEvents();
        });
    },

    initializeEvents: function () {
      var events = {};
      events['click #submit'] = 'onSubmitClick';
      events['click #add-segment'] = 'onAddSegmentClick';
      this.delegateEvents(events);
    },

    getStoreFrontDefaults: function () {
      var me = this;
      return new B(function (resolve) {
        chrome.tabs.getSelected(null, function (tab) {
          var url = tab.url;
          var matches = url.match(/\/[A-Z][A-Z0-9]M0\//);
          if (!_.isEmpty(matches)) {
            var storeFront = matches[0].substring(1,3);
            me.sendMessageToBackground({
              msg: 'store_front_defaults',
              value: storeFront
            })
              .then(function (res) {
                resolve(res);
              });
          } else {
            resolve({});
          }
        });
      });
    },

    sendMessageToBackground: function (message) {
      return new B(function (resolve) {
        chrome.runtime.sendMessage(message, function(response) {
          return resolve(response);
        });
      })
    }
  });

  return ProjectListView;
});