# simple watch

  Fires events when objects change.

[![Build Status](https://travis-ci.org/timoxley/simple-watch.png?branch=master)](https://travis-ci.org/timoxley/simple-watch)

## Installation

    $ component install timoxley/simple-watch

## Examples

### Watch object properties

```js
var watch = require('simple-watch')()

var user = {name: 'Tim', age: 27}

watch(user, 'name', function(current, previous) {
  console.log('Name was '+ previous +'. Name is now '+ current +'.')
})

user.name = 'Tim Oxley'
// => Name was Tim. Name is now Tim Oxley
```

### Watch expressions
```js
var user = {name: 'Tim', age: 27}

watch(user, 'age > 27', function() {
  console.log(user.name ' is now ' + user.age)
})

user.age++

// => Tim is now 28

``` 

## License

  MIT
