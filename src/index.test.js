const { test } = require('tape')
const { check, gen } = require('tape-check')
const {
  patroon,
  typed,
  NoMatchError,
  _
} = require('./index')

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
  try {
    console.log('XXX', typed(20))
    typed(20)
  } catch (e) {
    t.ok(e instanceof Error)
    t.end()
  }
})

test('Throws in a predicate function', t => {
  try {
    patroon(
      () => { throw new TypeError() }, () => {}
    )()
  } catch (e) {
    t.ok(e instanceof TypeError)
    t.end()
  }
})

test('Throws when an uneven amount of arguments are passed', t => {
  try {
    patroon(1)
  } catch (e) {
    t.ok(e instanceof TypeError)
    t.end()
  }
})
