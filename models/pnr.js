define(function (require) {
  var Backbone = require('backbone');
  var B = require('bluebird');
  var _ = require('underscore');
  var Defaults = require('text!defaults.json');
  var Chance = require('chance');
  var moment = require('moment');
  var Model = Backbone.Model.extend({});

  Model.getInstance = function () {
    if (!Model.instance) {
      Model.instance = new Model({});
    }
    return Model.instance;
  };

  Model.prototype.getDefaultStoreFrontValues = function (storeFront) {
    var defaults = JSON.parse(Defaults);
    var data = _.find(defaults, function (value, key) {
      return key === storeFront;
    });
    return data.singleSegment;
  };

  Model.prototype.getSkeletonForData = function () {
    return {
      "oneSegment": {
        "airSegments": []
      },
      "multiSegment": {
        "airSegments": [
          {
            "airSegment": [],
            "description": null,
            "id": "1"
          }
        ]
      },
      "profile": [
        {
          "pax": [],
          "pnr": null,
          "flightType": "OneSegment",
          "name": "MULTIPAX_ONESEG_CONFIRMATION",
          "id": "1"
        }
      ],
      "usmultiSegment": null,
      "usdomecticOneSegment": null,
      "usdomesticMultiSegment": null,
      "usoneSegment": null
    };
  };

  Model.prototype.getDOB = function (type) {
    var date;
    switch (type) {
      case "ADULT":
        date = 'DB/' + moment().subtract(30, 'years').format('DDMMMYYYY').toUpperCase() + '/M';
        break;
      case "CHILD":
        date = 'DB/' + moment().subtract(6, 'years').format('DDMMMYYYY').toUpperCase() + '/M';
        break;
      case "Infant":
        date = moment().subtract(1, 'years').format('DDMMMYYYY').toUpperCase();
        break;
      default:
        date = moment().subtract(30, 'years').format('DDMMMYYYY').toUpperCase();
        break;
    }
    return date;
  };

  Model.prototype.getData = function (data) {
    var me = this;
    var skeleton = this.getSkeletonForData();
    var segments = data.segments;
    if (segments.length === 1) {
      skeleton.oneSegment.airSegments.push(data.segments[0]);
    }
    var chance = new Chance();
    _.reduce(data.pax, function (memo, p) {
      memo.ssr = [];
      var name = chance.name().split(' ');
      memo.firstName = name[0];
      memo.lastName = name[1];
      memo.type = p;
      var ssrInfo = {
        "seg": null,
        "withText": me.getDOB(p),
        "parentRef": null,
        "type": "DOCS"
      };
      memo.ssr.push(ssrInfo);
      skeleton.profile[0].pax.push(memo);
      return {};
    }, {});
    return skeleton;
  };

  Model.prototype.getPNR = function(data) {
    var pnrInfo = this.getData(data);
    return B.resolve($.ajax({
        url: 'http://ec2-52-3-163-28.compute-1.amazonaws.com:9080/PNR',
        method: 'POST',
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(pnrInfo),
        beforeSend: function (request)
            {
                request.setRequestHeader("airline", "EY");
                request.setRequestHeader("environment", "CERT");
            }
      }))
      .then(function(tokenResponse) {
        if (tokenResponse.pnr) {
          return tokenResponse;
        }
        return B.reject();
      });
  };

  return Model;
});
