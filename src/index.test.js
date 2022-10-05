const { test } = require('tape')
const { isNil } = require('./helpers')
const { check, gen } = require('tape-check')
const { version } = require('../package')
const {
  reference,
  instanceOf,
  matches,
  typed,
  t,
  ref,
  every,
  some,
  multi,
  patroon,
  NoMatchError,
  UnevenArgumentCountError,
  _
} = require('./index')

test('Matches on a simple primitive', t => {
  t.equal(patroon(
    1, 2,
    2, 3
  )(2), 3)
  t.end()
})

test('Matches using a RegExp', t => {
  patroon(
    { a: /^bunion/ }, () => t.fail(),
    { a: /^banana/ }, () => t.pass()
  )({ a: 'banana tree' })

  patroon(
    /^bunion/, () => t.fail(),
    /^banana/, () => t.end()
  )('banana tree')
})

test('Match using reference', t => {
  patroon(
    1, () => t.fail(),
    Number, () => t.fail(),
    reference(Number), t.end()
  )(Number)
})

test('Matches on type and value', t => {
  patroon(
    every(instanceOf(Error), { x: 20 }), () => t.fail(),
    every(instanceOf(Error), { x: 10 }), () => t.end(),
    instanceOf(Error), () => t.fail()
  )(Object.assign(new Error(), { x: 10 }))
})

test('Matches always when pattern equals value', check(gen.any, (t, val) => {
  patroon(val, () => t.end())(val)
}))

test('Matches when empty array matches with empty array', t => {
  patroon([], () => t.end())([])
})

test('May or may not match with any value', check(gen.any, gen.any, (t, a, b) => {
  patroon(
    a, () => t.end(),
    _, () => t.end()
  )(b)
}))

test('Matches none of the patterns and throws', t => {
  t.plan(1)
  t.throws(() =>
    patroon(
      1, () => t.fail(),
      2, () => t.fail()
    )(3), NoMatchError)
})

test('Does not match when a value does not exist', t => {
  patroon(
    { a: { b: 2 } }, () => t.fail(),
    _, () => t.end()
  )({})
})

test('Throws in a predicate function', t => {
  class SomeError extends Error { }

  t.plan(1)
  t.throws(
    () => patroon(() => { throw new SomeError() }, () => {})(),
    SomeError
  )
})

test('Throws when an uneven amount of arguments are passed', t => {
  t.plan(1)
  t.throws(() => patroon(1), UnevenArgumentCountError)
})

test('Matches when every pattern matches', t => {
  t.plan(4)

  const F = () => {
    t.pass('False called')
    return false
  }

  const T = () => {
    t.pass('True called')

    return true
  }

  patroon(
    every(F, F, F), () => t.fail(),
    every(T, T, T), () => t.end()
  )(null)
})

test('Matches when some pattern matches', t => {
  t.plan(4)

  const F = () => {
    t.pass('False called')
    return false
  }

  const T = () => {
    t.pass('True called')

    return true
  }

  patroon(
    some(F, F, F), () => t.fail(),
    some(T, T, T), () => t.end()
  )(null)
})

test('Matches when comparing array with object', t => {
  patroon(
    [1], () => t.end()
  )({ 0: 1 })
})

test('Matches when comparing array with object', t => {
  patroon(
    { 0: 1 }, () => t.end()
  )([1])
})

test('Matches always when pattern equals value', check(gen.any, (t, val) => {
  patroon(multi(val), true)(val)
  patroon(multi(_, val), true)(null, val)
  patroon(multi(_, _, val), true)(null, null, val)

  t.end()
}))

test('Matches always when arguments match multi pattern', check(gen.array(gen.any), (t, args) => {
  patroon(
    multi(...args), () => t.end()
  )(...args)
}))

test('Deprecated functions', ts => {
  ts.plan(3)

  const consoleError = console.error

  console.error = message =>
    ts.ok(message.startsWith('[patroon] deprecated: '))

  typed(Error, null)(new Error())
  t(Error, null)(new Error())
  ref(Error, null)(Error)
  console.error = consoleError
  ts.end()
})

test('Returns primitive values', check(gen.primitive, (t, primitive) => {
  t.equals(patroon(true, primitive)(true), primitive)
  t.end()
}))

test(
  'Does not match primitive with empty object or array',
  check(gen.primitive, (t, primitive) => {
    t.plan(2)
    t.throws(() => patroon([], true)(primitive), NoMatchError)
    t.throws(() => patroon({}, true)(primitive), NoMatchError)
  }))

test('Matching on nil values', check(gen.any, v => !isNil(v), (t, any) => {
  t.plan(2)
  t.throws(() => patroon(any, true)(undefined), NoMatchError)
  t.throws(() => patroon(any, true)(null), NoMatchError)
}))

// Circular reference
const circular = {}
circular.a = circular

test('Allows recursive patterns', t => {
  t.plan(1)
  t.ok(patroon(circular, true)(circular))
})

test('Throws and prints because path is not defined', t => {
  t.plan(1)
  t.throws(() => patroon({ b: _ }, true)(circular), NoMatchError)
})

test('Does not throw when value is recursive', t => {
  t.plan(1)
  t.ok(patroon({ a: _ }, true)(circular))
})

test('Does not match on reference', t => {
  t.plan(4)
  t.ok(patroon({ a: {} }, true)({ a: {} }))
  t.ok(patroon({ a: [] }, true)({ a: [] }))
  t.ok(patroon({ a: [] }, true)({ a: {} }))
  t.ok(patroon({ a: {} }, true)({ a: [] }))
  t.end()
})

test('Matches function', check(gen.any, gen.any, (t, a, b) => {
  t.ok(matches(a)(a))
  t.equals(typeof matches(a)(b), 'boolean')
  t.end()
}))

test('Check that matches throws non patroon errors', t => {
  class SomeError extends Error { }

  const predicate = () => {
    throw new SomeError()
  }
  const pattern = {
    predicate
  }

  t.throws(() => matches(pattern)({ predicate: 2 }), SomeError)
  t.end()
})

if (version.startsWith('2')) {
  test('Deprecated functions in version 2', t => {
    t.plan(3)
    t.ok(isNil(require('./index').typed))
    t.ok(isNil(require('./index').t))
    t.ok(isNil(require('./index').ref))
  })
}
