var watch = require('simple-watch')
var assert = require('timoxley-assert')

var user
beforeEach(function() {
  user = {
    name: 'Tim',
    age: 27
  }
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
    setTimeout(function() {
      watch.unwatch(user)
      user.name = 'Tim Oxley'
      user.age++
      setTimeout(function() {done()}, watch.interval * 2)
    }, watch.interval * 2)
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

