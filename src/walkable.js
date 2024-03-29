const { isEmpty, isFunction, isNil, isPrimitive } = require('./helpers')

function walk (config, transform, item, path = []) {
  if (config.isLeafe(item)) { return transform(item, path) }

  if (config.isCircular(item)) { return transform(item, path) }

  return config.map((v, i) => walk(config, transform, v, [...path, i]), item)
}

function reduce (config, cb, acc, item) {
  walk(config, (item, path) => {
    acc = cb(acc, item, path)

    return item
  }, item)

  return acc
}

function isArray (v) {
  return Array.isArray(v)
}

function isObject (v) {
  return typeof v === 'object' && v !== null
}

const isCircular = (visited = []) => x => {
  const isCircular = visited.includes(x)

  visited.push(x)

  return isCircular
}

function isLeafe (x) {
  return Number.isNaN(x) || isNil(x) || x instanceof RegExp || isFunction(x) || isEmpty(x) || (!isObject(x) && !isArray(x))
}

function mapLeaves (config, cb, item) {
  return reduce(config, (acc, item, path) =>
    [...acc, cb(item, path)], [], item)
}

class PathError extends TypeError {}

function path (pth, v, errorData) {
  if (isNil(errorData)) { return path(pth, v, { path: pth, value: v }) }

  if (pth.length === 0) { return v }

  const [key, ...rest] = pth

  if (isPrimitive(v) || !(key in v)) {
    const error = new PathError(
      `Cannot read path ${pth}.`)

    Object.assign(error, errorData)

    throw error
  }

  return path(rest, v[key], errorData)
}

function map (fn, x) {
  // Should this code be here?
  // if (!isDefined(x)) { throw new TypeError(`Cannot map over ${x}`) }

  return isFunction(x.map)
    ? x.map(fn)
    : Object.keys(x).reduce((y, prop) => {
      y[prop] = fn(x[prop], prop)
      return y
    }, {})
}

function walkable (config = {}) {
  config = {
    isLeafe,
    map,
    ...config
  }

  const api = {
    PathError,
    path
  }

  return [
    walk,
    reduce,
    mapLeaves
  ].reduce((api, fn) => {
    api[fn.name] = (...args) => fn({
      isCircular: isCircular(),
      ...config
    }, ...args)

    return api
  }, api)
}

module.exports = walkable
