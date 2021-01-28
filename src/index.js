const { mapLeaves, path, PathError } = require('./walkable')()
const { isConstructor, isFunction, equals, T, is, tryCatch, isEven, isNil, toPairs, always } = require('./helpers')

const match = pattern => {
  // TODO: also check if something is a constructor

  const patternPredicates = mapLeaves(
    (value, pth) => tryCatch(
      isConstructor(value)
        ? typed(value)
        : (isFunction(value)
            ? arg => value(path(pth, arg))
            : arg => equals(path(pth, arg), value)),
      e => {
        if (e instanceof PathError) { return false }

        throw e // How to test this case?
      }
    ),
    pattern
  )

  return (...args) => patternPredicates.every(pred => pred(...args))
}

class NoMatchError extends Error {
  constructor (...args) {
    super(...args)
    this.name = 'NoMatchError'
  }
}
const toFunction = x => isFunction(x) ? x : always(x)

const patroon = (...list) => {
  if (!isEven(list.length)) { throw new TypeError('Patroon should have even amount of arguments.') }

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
  patroon,
  ref,
  _: T,
  typed,
  t: typed
})
