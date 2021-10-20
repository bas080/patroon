const { test } = require('tape')
const { check, gen } = require('tape-check')
const {
  ref,
  patroon,
  typed,
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
    ref(Number), t.end()
  )(Number)
})

test('Matches on type and value', t => {
  patroon(
    typed(Error, { x: 20 }), () => t.fail(),
    typed(Error, { x: 10 }), () => t.end(),
    typed(Error), () => t.fail()
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

test('Throws when a typed does not receice a constructor', t => {
  t.plan(1)
  t.throws(() => typed(20), Error)
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
