"use strict"

var _ = require('to-function')

var NO_PREVIOUS = {}

function watch(target, expression, fn) {

  if (typeof expression === 'function') {
    fn = expression
    expression = undefined
  }
  if (typeof target === 'function') {
    expression = target
    target = target
  }


  if (!target) {
    throw new Error('Missing target!')
  }
  if (!fn) {
    throw new Error('Missing callback!')
  }
  if (!expression && typeof target !== 'function') {
    return watchAll(target, fn)
  }
  if (Array.isArray(expression)) return watchMany(target, expression, fn)
  return watchOne(target, expression, fn)
}

watch.unwatch = function unwatch(target, expression, fn) {
  var matches = watch.list.filter(function(item) {
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
  watch.list = watch.list.filter(function(item) {
    return !~matches.indexOf(item)
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
}

function watchMany(target, properties, fn) {
  properties.forEach(function(property) {
    watch(target, property, function(current, previous, item) {
      fn(property, current, previous, item)
    })
  })
}

function watchAll(target, fn) {
  var properties = Object.keys(target)
  return watchMany(target, properties, fn)
}

watch.interval = 10
watch.list = []

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

module.exports.start = start
module.exports.stop = stop
module.exports = watch
