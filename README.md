# Patroon

![Code Coverage](https://img.shields.io/badge/coverage-100%25-green?style=flat-square)
[![NPM](https://img.shields.io/npm/v/patroon?color=blue&style=flat-square)](https://www.npmjs.com/package/patroon)

Pattern matching in Javascript without additional syntax.

## Implementation

1. [./src/walkable.js][2] - Patroon allows one to define deeply nested
   patterns. To implement these features succinctly we use an abstraction
   which allows the traversing of a tree. This is an area of computer science
   named [tree traversal][1].
2. [./src/index.js][3] - We now take the walkable utility and implement
   patroon's functionality.
3. [./src/helpers.js][4] - You might have noticed that both the patroon and
   walkable modules have common helper functions.

## Installation

[Patroon][9] is hosted on the NPM repository.

```bash
npm install patroon
```

## Specifications

Let's see what valid and less valid uses of patroon are.

### Primitives

The simplest thing one can do is match on a primitive.

```js ./tape-test
t.equal(patroon(
  2, 3,
  1, 2
)(1), 2)
t.end()
```

### Regular Expressions

Will check if a Regex matches the passed string using the `.test` method.

```js ./tape-test
patroon(
  /^bunion/, fail,
  /^banana/,end
)('banana tree')
```

### Arrays

A less intuitive case (at least initially) is the matching with an empty array.

```js ./tape-test
patroon(
  [], end,
  [1], fail
)([1])
```

Notice that the empty array matches with `[1]`. This is because the empty array
is a subset of `[1]`.

You might as well write the following for readability sake:

```js ./tape-test
patroon(
  typed(Array), end,
)([1])
```

Patroon tries to determine if something is a constructor. No need to use typed
for this case.

```js ./tape-test
patroon(
  Number, fail,
  Array, end,
)([1])
```

If you wish to match on the reference of a constructor you can use the `ref`
helper.

```js ./tape-test
patroon(
  1, fail,
  Number, fail,
  ref(Number), end,
)(Number)
```

Some more array examples to wrap your brain around.

```js ./tape-test
const arrayMatch = patroon(
  [1,2], () => 2,
  [1,2,3], () => 3,
  [2], () => 1,
  [], () => null
)

t.equal(arrayMatch([1,2]), 2)
t.equal(arrayMatch([1,2,3]), 2)
t.equal(arrayMatch([]), null)
t.equal(arrayMatch([2, 3]), 1)
t.end()
```

How to define default argument values:

```js ./tape-test
const count = patroon(
  [_], ([, ...xs], n=0) => count(xs, n + 1),
  [], (array, c=0) => c
)

t.equal(count([]), 0)
t.equal(count([1]), 1)
t.equal(count([1, 2]), 2)
t.end()
```

The array pattern assumes that the array has rest elements. It's a design
choice which avoids adding additional helpers with little to no downsides.

In case the seemingly unexpected case seems truly unexpected; I suggest you
think of patterns as a subset of the value you are trying to match. In the case
of arrays. `[1,2]` is a subset of `[1,2,3]`. `[2,3]` is not a subset of
`[1,2,3]` because arrays also care about the order of elements.

Now is a good time to introduce the placeholder(`_`) concept.

### Placeholders

```js ./tape-test
const alwaysMatches = patroon(_, t.end())('any value really')
```

A function that looks for a certain pattern in an array.

```js ./tape-test
const containsPattern = patroon(
  [0, 0], true,
  [_, _], ([, ...rest]) => containsPattern(rest),
  [], false
)

t.true(containsPattern([0,0]))
t.true(containsPattern([1,0,0]))
t.false(containsPattern([1,0,1]))
t.true(containsPattern([1,0,1,0,0]))
t.end()
```

A toPairs function:

```js ./tape-test
const toPairs = patroon(
  [_, _], ([a, b, ...c], p = []) => toPairs(c, [...p, [a, b]]),
  _, (_, p = []) => p
)

t.deepEqual(toPairs([1]), [])
t.deepEqual(toPairs([1, 2]), [[1, 2]])
t.deepEqual(toPairs([1, 2, 3]), [[1, 2]])
t.deepEqual(toPairs([1, 2, 3, 4]), [[1, 2], [3, 4]])
t.end()
```

> An exercise would be to change toPairs to throw when an uneven length array
> is passed. Multiple answers are possible and some are more optimized than
> others.

So that's arrays. What about objects.

### Objects

Just like an empty array; matching on an empty object can be written in three
ways.

```js ./tape-test
patroon(
  {}, pass,
)({a: 1})

patroon(
  typed(Object), pass,
)({a: 1})

patroon(
  Object, end,
)({a: 1})
```

Next we match on the existence of object keys. We use the `_` to
achieve this.

```js ./tape-test
patroon(
  {a: _}, end
)({a: 2})
```

Next we also match on the key's value.

```js ./tape-test
patroon(
  {a: 1}, fail,
  {a: 2}, end,
  {a: 3}, fail
)({a: 2})
```

What about nested objects? No problem!

```js ./tape-test
patroon(
  {a: {a: 1}}, fail,
  {a: {a: 2}}, end,
  {a: {a: 3}}, fail
)({a: {a: 2}})
```

### Types

We'll match on type using `typed` which internally uses `instanceof`.


```js ./tape-test
patroon(
  typed(TypeError), fail,
  typed(Error), pass
)(new Error())

patroon(
  TypeError, end,
  Error, fail
)(new TypeError())
```

An object of a certain type might also have values we would want to match on.
Here you do need to use the typed helper.

```js ./tape-test
patroon(
  typed(TypeError, { value: 20 }), fail,
  typed(Error, { value: 30 }), fail,
  typed(Error, { value: 20 }), end
)(Object.assign(new Error(), { value: 20 }))
```

Simply pass a pattern as the second argument of typed.

Now we'll try predicates.

### Predicates

By default a function is assumed to be a predicate.

```js ./tape-test
const isTrue = v => v === true

patroon(
  isTrue, end
)(true)
```

You might have a case where you want to match on the reference of a function.
Some people are weird like that. In that case one can use the ref helper.

```js ./tape-test
const fun = () => false

patroon(
  fun, fail,
  ref(fun), end
)(fun)
```

Could one combine predicates with arrays and objects? Sure one can!

```js ./tape-test
const is20 = v => v === 20

patroon(
  [[is20]], end,
)([[20]])
```

```js ./tape-test
const is42 = v => v === 42

patroon(
  [{a: is42}], end,
)([{a: 42}])
```

### Custom Helpers

It is very easy to write your own helpers. All the builtin helpers are really
just predicates. Let's look at the source of one of these helpers, the simplest
one being the `_` helper.

```js
const _ = () => true
```

Other more complex helpers like the typed helper are also predicates. See the
[./src/index.js][3] if you are interested in their implementation.

## Tests

Now for some additional edge cases and some generative testing.
[./src/index.test.js][5]

First make sure the dependencies are clean.

```bash bash &> /dev/null
npm i && npm prune
```

We also care about code coverage so we'll use [nyc][8] to generate a coverage
report.

```bash bash
npx nyc npm t && npx nyc check-coverage
```
```

> patroon@0.1.2 test
> tape ./src/index.test.js

TAP version 13
# Matches on a simple primitive
ok 1 should be strictly equal
# Matches using a RegExp
# Match using reference
# Matches on type and value
# Matches always when pattern equals value
# Matches none of the patterns and throws
ok 2 should be truthy
# Does not match when a value does not exist
# Throws when a typed does not receice a constructor
ok 3 should be truthy
# Throws in a predicate function
ok 4 should be truthy
# Throws when an uneven amount of arguments are passed
ok 5 should be truthy

1..5
# tests 5
# pass  5

# ok

-------------|---------|----------|---------|---------|-------------------
File         | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------|---------|----------|---------|---------|-------------------
All files    |     100 |      100 |     100 |     100 |                   
 helpers.js  |     100 |      100 |     100 |     100 |                   
 index.js    |     100 |      100 |     100 |     100 |                   
 walkable.js |     100 |      100 |     100 |     100 |                   
-------------|---------|----------|---------|---------|-------------------
```

## Formatting

Standard is good enough.

```bash bash 2>&1
npx standard || npx standard --fix
```

## Stackoverflow

This project is mentioned in the following [stackoverflow question][7].

## Documentation

The README.md is generated using [markatzea][6].

```bash
markatzea README.mz > README.md
```

## Contribute

You may contribute in whatever manner you see fit. Do try to be helpful and
polite. Some suggestions for contributions:

- [ ] A fitting logo.
- [ ] Find and report bugs and inconsistencies.
- [ ] Improve documentation.
- [ ] Prevent exceeding stack size by managing recursive patterns.
- [ ] Suggest API improvements in naming and functionality.

[1]:https://en.wikipedia.org/wiki/Tree_traversal
[2]:https://github.com/bas080/patroon/blob/master/src/walkable.js
[3]:https://github.com/bas080/patroon/blob/master/src/index.js
[4]:https://github.com/bas080/patroon/blob/master/src/helpers.js
[5]:https://github.com/bas080/patroon/blob/master/src/index.test.js
[6]:https://github.com/bas080/markatzea
[7]:https://stackoverflow.com/questions/50452844/functional-programming-style-pattern-matching-in-javascript/67376827#67376827
[8]:https://github.com/istanbuljs/nyc
[9]:https://www.npmjs.com/package/patroon
