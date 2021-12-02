const { test } = require('tape')
const { isNil } = require('./helpers')
const { check, gen } = require('tape-check')
const { version } = require('../package')
const {
  reference,
  instanceOf,
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

test('Matches none of the patterns and throws', t => {
  try {
    patroon(
      1, () => t.fail(),
      2, () => t.fail()
    )(3)
    t.fail()
  } catch (e) {
    t.ok(e instanceof NoMatchError)
    t.end()
  }
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

test('Matches when arguments match multi pattern', check(gen.any, (t, val) => {
  patroon(
    multi(0, 1, 2), () => t.fail(),
    multi(1, 2, 3), () => t.end()
  )(1, 2, 3)
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

if (version.startsWith('2')) {

  test('Deprecated functions in version 2', t => {
    t.plan(3)
    t.ok(isNil(require('./index').typed))
    t.ok(isNil(require('./index').t))
    t.ok(isNil(require('./index').ref))
  })

}

