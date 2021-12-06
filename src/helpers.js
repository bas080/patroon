const toPairs = items => {
  if (items.length < 2) { return [] }

  const [a, b, ...rest] = items

  return [[a, b], ...toPairs(rest)]
}

const isNil = x => !(x != null)

function isDefined (x) {
  return x != null
}

const T = () => true

const is = Ctor => instance => isDefined(instance) && (instance.constructor ===
  Ctor || instance instanceof Ctor)

function isPrimitive (x) {
  return x !== Object(x)
}

function isEmpty (x) {
  return !isPrimitive(x) && (Object.keys(x).length === 0)
}

module.exports = {
  isPrimitive,
  isEmpty,
  isDefined,
  always: x => () => x,
  is,
  toPairs,
  isNil,
  isEven (x) {
    return x % 2 === 0
  },
  tryCatch (tryFn, catchFn) {
    return (...args) => {
      try {
        return tryFn(...args)
      } catch (e) {
        return catchFn(e)
      }
    }
  },
  T,
  equals (a, b) {
    return a === b || Object.is(a, b)
  },
  isFunction (x) {
    return typeof x === 'function'
  }
}
