(function (env) {
  'use strict';

  var registry = {};

  var register = function (name, module) {
    if (registry[name]) { throw 'module already registered: ' + name; }
    registry[name] = { module: module, ready: false };
  };

  var getter = function (parent) {
    var errPrefix = parent ? (parent + ': ') : '';

    return function (name) {
      var entry = registry[name];

      if (!entry) { throw errPrefix + 'module not registered: ' + name; }
      if (entry.ready) { return entry.module; }

      entry.module = entry.module(getter(name));
      entry.ready = true;

      return entry.module;
    };
  };

  var get = getter();

  var root = function (callback) {
    env.onReady(function () { callback(get); });
  };

  var module = function (a, b) {
    if (typeof a === 'string' && typeof b === 'function') {
      return register(a, b);
    }

    if (typeof a === 'function') { return root(a); }
    if (typeof a === 'string') { return get(a); }
  };

  env.register('module', module);
})({
  onReady: function (callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }

    document.addEventListener("DOMContentLoaded", callback);
  },
  register: function (name, module) {
    window[name] = module;
  }
});
