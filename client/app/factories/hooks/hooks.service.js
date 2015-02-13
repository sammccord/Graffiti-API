'use strict';

angular.module('graffitiApiApp')
  .factory('hooks', function () {
    // Service logic
    // ...

    var hooks = {};

    // Public API here
    return {
      on: function(eventName, fn) {
        if (hooks[eventName]) {
          hooks[eventName].push(fn)
        } else {
          hooks[eventName] = [fn]
        }
      },
      trigger: function(eventName, data) {
        if (hooks[eventName]) {
          hooks[eventName].forEach(function(fn) {
            fn(data);
          });
        } else {
          console.log('no hook')
        }
      }
    };
  });
