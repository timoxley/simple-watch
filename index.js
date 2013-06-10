"use strict"

var _ = require('to-function')

var NO_PREVIOUS = {}

module.exports = function(interval) {
  watch.start = start
  watch.stop = stop
  watch.interval = interval || 10
  watch.list = []

  /**
   * Watch a property on target, 
   * or a function.
   */

  function watch(target, expression, fn) {
    if (typeof expression === 'function') {
      fn = expression
      expression = undefined
    }

    if (typeof target === 'function') {
      expression = target
    }

    if (!target) {
      throw new Error('Missing target!')
    }

    if (!fn) {
      throw new Error('Missing callback!')
    }

    // handle watch(target, fn)
    if (!expression) {
      if (Array.isArray(target)) return watchArray(target, fn)
      if (typeof target !== 'function') return watchAll(target, fn)
    }

    // handle watch(target, ['prop1', 'prop2'], fn)
    if (Array.isArray(expression)) return watchMany(target, expression, fn)

    // handle watch(target, expression, fn)
    return watchOne(target, expression, fn)
  }

  /**
   * Remove watcher from watch list, if it matches
   * all of supplied target, expression, or fn
   *
   * @param {Mixed} target remove watchers on `target`. If only argument supplied, remove all watchers on target.
   * @param {Mixed} expression remove watchers on `target` that also match `expression`.
   * @param {Function} fn remove watchers on `target` matching this callback.
   * @api private
   */

  watch.unwatch = function unwatch(target, expression, fn) {
    if (!arguments.length) return watch.list = []
    var matches = findWatchers(target, expression, fn)
    watch.list = watch.list.filter(function(item) {
      return !~matches.indexOf(item)
    })
  }

  function findWatchers(target, expression, fn) {
    if (!arguments.length) return []
    // find watcher matching target/expression/fn combo
    return watch.list.filter(function(item) {
      return item.target === target
    })
    .filter(function(item) {
      if (!expression) return true // skip if no expression
      if (typeof expression === 'function') return item.expressionFn === expression
      return item.expressionString === expression
    })
    .filter(function(item) {
      if (!fn) return true // skip if no expression
      return item.callback === fn
    })
  }

  function watchOne(target, expression, fn) {
    var watchMeta = {
      previous: NO_PREVIOUS,
      target: target,
      expressionFn: _(expression),
      expressionString: expression,
      callback: fn,
      eq: strictEqual
    }
    watchMeta.previous = evaluate(watchMeta)
    watch.list.push(watchMeta)
    return {
      unwatch: watch.unwatch.bind(watch, target, expression, fn)
    }
  }

  function watchMany(target, properties, fn) {
    var watchInfo = properties.map(function(property) {
      var invoke = function(current, previous, item) {
        fn(property, current, previous, item)
      }
      watch(target, property, invoke)
      return {
        target: target,
        property: property,
        invoke: invoke
      }
    })
    return {
      unwatch: function() {
        watchInfo.forEach(function(info) {
          watch.unwatch(info.target, info.property, info.invoke)
        })
      }
    }
  }

  function watchAll(target, fn) {
    var properties = Object.keys(target)
    return watchMany(target, properties, fn)
  }

  function watchArray(array, fn) {
    return watchOne(array, function() {
      return JSON.stringify(array)
    }, fn)
  }

  function strictEqual(a, b) {
    return a === b
  }

  function tick() {
    var changedItems = watch.list.filter(function(item) {
      return evaluateChanged(item)
    })
    changedItems.forEach(function(changedItem) {
      changedItem.callback(changedItem.current, changedItem.previous, changedItem.target)
      changedItem.previous = changedItem.current
      changedItem.current = undefined
    })
  }

  function evaluateChanged(watchMeta) {
    watchMeta.current = evaluate(watchMeta)
    return !watchMeta.eq(watchMeta.current, watchMeta.previous)
  }

  function evaluate(watchMeta) {
    return watchMeta.expressionFn(watchMeta.target)
  }

  function start() {
    return setTimeout(function() {
      tick()
      start()
    }, watch.interval)
  }

  var timeout = start()

  function stop() {
    return clearTimeout(timeout)
  }

  return watch
}
