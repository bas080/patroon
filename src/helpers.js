const toPairs = items => {
  if (items.length < 2) { return [] }

  const [a, b, ...rest] = items

  return [[a, b], ...toPairs(rest)]
}

const isNil = x => !(x != null)

function isConstructor (func) {
  return Boolean(func && typeof func === 'function' && func.prototype && func.prototype.constructor)
}

module.exports = {
  always: x => () => x,
  isConstructor,
  toPairs,
  isNil,
  isEven (x) {
    return x % 2 === 0
  },
  is: Ctor => {
    if (!isConstructor(Ctor)) {
      throw new Error('Ctor is not a constructor')
    }

    return instance =>
      instance.constructor === Ctor || instance instanceof Ctor
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
  T () {
    return true
  },
  equals (a, b) {
    return a === b || Object.is(a, b)
  },
  isFunction (x) {
    return typeof x === 'function'
  },
  isDefined (x) {
    return x != null
  }
}
