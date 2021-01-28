const { isFunction, isDefined } = require('./helpers')

function walk (config, transform, item, path = []) {
  if (config.isLeafe(item)) { return transform(item, path) }

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

function isLeafe (x) {
  return Number.isNaN(x) || !isDefined(x) || isFunction(x) || (!isObject(x) && !isArray(x))
}

function mapLeaves (config, cb, item) {
  return reduce(config, (acc, item, path) =>
    [...acc, cb(item, path)], [], item)
}

class PathError extends TypeError {}

function path (pth, v) {
  if (pth.length === 0) { return v }

  const [key, ...rest] = pth

  if (!(key in v)) {
    throw new PathError(
      `Cannot read path '${JSON.stringify(pth)}' on ${JSON.stringify(v)}`)
  }

  return path(rest, v[key])
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
    api[fn.name] = fn.bind(null, config)

    return api
  }, api)
}

module.exports = walkable
