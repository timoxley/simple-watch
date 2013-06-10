"use strict"

if (typeof window === "undefined") {
  var Watch = require('../')
  var assert = require('assert')
} else {
  var Watch = require('simple-watch')
  var assert = require('timoxley-assert')
}

var watch = Watch()

var user
beforeEach(function() {
  user = {
    name: 'Tim',
    age: 27
  }
})

afterEach(function() {
  watch.unwatch()
})

var shouldNotCall = function() {
  throw new Error('Should not fire')
}

describe('error conditions', function() {
  it('throws when given no arguments', function() {
    assert.throws(function() {
      watch()
    })
  })
  it('throws when given no target', function() {
    assert.throws(function() {
      watch(undefined, 'name', function(){})
    })
  })
  it('throws when given no callback', function() {
    assert.throws(function() {
      watch(user, 'name')
    })
  })
  it('throws when given no callback or properties', function() {
    assert.throws(function() {
      watch(user)
    })
  })
})

describe('expressions', function() {
  it('detects changes to properties', function(done) {
    watch(user, 'name', function() {
      done()
    })
    user.name = 'Tim Oxley'
  })

  it('detects changes lists of properties', function(done) {
    var count = 0
    watch(user, ['name', 'age'], function() {
      count++
      user.age++
      if (count === 2) return done()
    })
    user.name = 'Tim Oxley'
  })

  it('detects changes to simple expressions', function(done) {
    watch(user, 'age > 27', function() {
      done()
    })
    user.age++
  })

  it('can detect changes to arrays by watching length', function(done) {
    user.friends = [
      'Bob',
      'Gary',
      'Bill'
    ]
    watch(user, 'friends.length', function() {
      done()
    })
    user.friends.pop()
  })

  it('detects changes to nested properties', function(done) {
    user.address = {}
    user.address.line1 = '2 Mistri Road'
    watch(user, 'address.line1', function() {
      done()
    })
    user.address.line1 = '3 Mistri Road'
  })

  it('can unwatch everything', function(done) {
    watch(user, 'name', shouldNotCall)
    watch(user, 'age', shouldNotCall)
    watch.unwatch()
    user.name = "tim"
    user.age++
    user.name += user.name
    setTimeout(function() {
      done()
    }, watch.interval * 2)
  })

  it('can unwatch expressions/properties', function(done) {
    watch(user, 'name', shouldNotCall)
    watch(user, 'age', function() {
      done()
    })
    watch.unwatch(user, 'name')
    user.name = "tim"
    setTimeout(function() {
      user.age++
    }, watch.interval * 2)
  })

  it('can unwatch a particular callback', function(done) {
    watch(user, 'name', shouldNotCall)
    watch(user, 'name', function() {
      setTimeout(function() {
        done()
      }, watch.interval * 2)
    })
    watch.unwatch(user, 'name', shouldNotCall)
    user.name = "tim"
  })
  it('can unwatch objects via return value', function(done) {
    var watcher = watch(user, 'name', shouldNotCall)
    watch(user, 'name', function() {
      setTimeout(function() {
        done()
      }, watch.interval * 2)
    })
    watcher.unwatch()
    user.name = "tim"
  })
  it('can unwatch expressions by return value', function(done) {
    var watcher = watch(user, 'name.length', shouldNotCall)
    watcher.unwatch()
    user.name += user.name
    setTimeout(function() {
      done()
    }, watch.interval * 2)
  })
})

describe('watching an object', function() {
  it('runs callback when objects change', function(done) {
    watch(user, function(property) {
      if (property === 'name') {
        user.age++
        return
      }
      if (property === 'age') {
        done()
        return
      }
    })
    user.name = 'Tim Oxley'
  })

  it('can unwatch objects', function(done) {
    watch(user, shouldNotCall)
    watch.unwatch(user)
    user.name = 'Tim Oxley'
    user.age++
    setTimeout(function() {done()}, watch.interval * 2)
  })
})

describe('watching a function', function() {
  var count, func
  beforeEach(function() {
    count = 0
    func = function() {
      return count++ // first time through should be same
    }
  })

  it('runs callback when result changes', function(done) {
    watch(func, function() {
      done()
    })
  })

  it('can unwatch functions', function(done) {
    watch(func, function() {
      throw new Error('should not fire')
    })
    watch.unwatch(func)
    setTimeout(function() { done() }, watch.interval * 2)
  })
})

describe('watching an array', function() {
  var arr, watcher
  beforeEach(function() {
    arr = []
  })
  afterEach(function() {
    watcher.unwatch()
  })
  it('does nothing if array is not changed', function(done) {
    arr = [{a: 1}, {b: 2}, {c: 3}]
    watcher = watch(arr, function() {
      throw new Error('should not fire')
    })
    setTimeout(function() {
      done()
    }, watch.interval * 2)
  })

  it('detects changes to arrays of primitives', function(done) {
    arr = [1,2,3,4,5]

    watcher = watch(arr, function(before, after, obj) {
      assert.equal(arr.length, 4)
      done()
    })
    arr.pop()
  })
  it('detects changes to arrays of objects', function(done) {
    arr = [{a: 1}, {b: 2}, {c: 3}]
    watcher = watch(arr, function(before, after, obj) {
      assert.equal(arr.length, 2)
      done()
    })
    arr.pop()
  })
  it('detects changes to contents of arrays of objects', function(done) {
    arr = [{a: 1}, {b: 2}, {c: 3}]
    watcher = watch(arr, function(before, after, obj) {
      done()
    })
    arr[0].a = 2
  })
})

describe('poll frequency', function() {
  var watcher
  beforeEach(function() {
    user.queriedAgo = function track() {
      var previous = track.current || 0
      track.current = Date.now()
      return track.current - previous
    }
  })
  afterEach(function() {
    watcher.unwatch()
    delete user.queriedAgo
  })
  it('only polls for changes every n milliseconds', function(done) {
    var count = 0

    watcher = watch(user, 'queriedAgo()', function(property) {
      count++
      if (count > 1 && property < watch.interval) throw new Error('polled too quickly')
      if (count > 5) done()
    })
  })

  it('can take a custom poll interval', function(done) {
    var count = 0
    var slowWatch = Watch(100)
    slowWatch(user, 'queriedAgo()', function(property) {
      count++
      if (count > 1 && property < slowWatch.interval) throw new Error('polled too quickly')
      if (count > 5) done()
    })
  })
})
