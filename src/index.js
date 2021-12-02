const { mapLeaves, path, PathError } = require('./walkable')()
const { isFunction, equals, T, is, tryCatch, isEven, isNil, toPairs, always } = require('./helpers')

const deprecated = (fn, message) => (...args) => {
  console.error(`[patroon] deprecated: ${message}`)
  return fn(...args)
}

const typed = deprecated(function typed (Ctor, pattern) {
  return every(Ctor, pattern)
}, 'replace "typed" or "t" helpers with "every(Constructor, pattern)"')

const isRegExp = is(RegExp)

const every = (...patterns) => {
  const matches = patterns.map(predicate)

  return (...args) => matches.every(pred => pred(...args))
}

const some = (...patterns) => {
  const matches = patterns.map(predicate)

  return (...args) => matches.some(pred => pred(...args))
}

const multiSymbol = Symbol('multi')

const multi = (...patterns) => {
  const matches = predicate(patterns)
  const multi = (...args) => matches(args)

  multi[multiSymbol] = true

  return multi
}

const predicate = pattern => {
  if (pattern && pattern[multiSymbol]) { return (...args) => pattern(...args) }

  const normalize = (value, pth) => {
    if (isRegExp(value)) return arg => value.test(path(pth, arg))

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

  const patterns = toPairs(list).map(([pattern, doFn]) => [predicate(pattern), toFunction(doFn)])

  return (...args) => {
    const found = patterns.find(([matches]) => matches(...args))

    if (isNil(found)) {
      const error = new NoMatchError('Not able to match any pattern for arguments')
      error.arguments = args

      console.error(args)

      throw error
    }

    return found[1](...args)
  }
}

function reference (any) {
  return value => any === value
}

function instanceOf (ctor) {
  return value => value instanceof ctor
}

module.exports = Object.assign(patroon, {
  NoMatchError,
  UnevenArgumentCountError,
  PatroonError,
  patroon,
  every,
  some,
  multi,
  ref: deprecated(reference, 'replace "ref(x)" with "reference(x)"'),
  reference,
  typed,
  t: typed,
  instanceOf,
  _: T
})
