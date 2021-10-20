const { mapLeaves, path, PathError } = require('./walkable')()
const { isConstructor, isFunction, equals, T, is, tryCatch, isEven, isNil, toPairs, always } = require('./helpers')

const isRegExp = is(RegExp)

const match = pattern => {
  // TODO: also check if something is a constructor

  const normalize = (value, pth) => {
    if (isRegExp(value)) return arg => value.test(arg)

    if (isConstructor(value)) { return typed(value) }

    if (isFunction(value)) { return arg => value(path(pth, arg)) }

    return arg => equals(path(pth, arg), value)
  }

  const patternPredicates = mapLeaves(
    (value, pth) => tryCatch(
      normalize(value, pth),
      e => {
        if (e instanceof PathError) { return false }

        throw e
      }
    ),
    pattern
  )

  return (...args) => patternPredicates.every(pred => pred(...args))
}

class PatroonError extends Error { }
class UnevenArgumentCountError extends PatroonError {}
class NoMatchError extends PatroonError {}

[
  PatroonError,
  UnevenArgumentCountError,
  NoMatchError
].forEach(e => {
  e.prototype.name = e.name
})

const toFunction = x => isFunction(x) ? x : always(x)

const patroon = (...list) => {
  if (!isEven(list.length)) { throw new UnevenArgumentCountError('Patroon should have an even amount of arguments.') }

  const patterns = toPairs(list).map(([pattern, doFn]) => [match(pattern), toFunction(doFn)])

  return (...args) => {
    const found = patterns.find(([matches]) => matches(...args))

    if (isNil(found)) { throw new NoMatchError(`Not able to match any pattern for value ${JSON.stringify(args)}`) }

    const [, doFn] = found

    return doFn(...args)
  }
}

function typed (Ctor, ...args) {
  if (args.length === 0) {
    return is(Ctor)
  }

  const [pattern] = args

  return (instance) =>
    typed(Ctor)(instance) &&
    match(pattern)(instance)
}

function ref (fn) {
  return (arg) => fn === arg
}

module.exports = Object.assign(patroon, {
  NoMatchError,
  UnevenArgumentCountError,
  PatroonError,
  patroon,
  ref,
  _: T,
  typed,
  t: typed
})
