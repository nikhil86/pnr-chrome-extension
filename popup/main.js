require(
    {
        baseUrl: chrome.extension.getURL('/'),
        paths: {
            backbone: 'vendors/backbone.min',
            underscore: 'vendors/lodash.custom.min',
            jquery: 'vendors/jquery-2.1.4.min',
            bluebird: 'vendors/bluebird.min',
            text: 'vendors/text',
            mustache: 'vendors/mustache.min',
            bootstrap: 'vendors/bootstrap/js/bootstrap.min'
        },
        shim: {
            backbone: {
                deps: ['jquery', 'underscore'],
                exports: 'Backbone'
            },
            mustache: {
              exports: 'Mustache'
            },
          bootstrap: {
            deps: ['jquery']
          }
        }
    },
    ['popup/app'],
    function (App) {
        window.app = new App({});

        window.app.run();
    }
);