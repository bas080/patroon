# Patroon

[![NPM](https://img.shields.io/npm/v/patroon?color=blue&style=flat-square)](https://www.npmjs.com/package/patroon)
[![NPM Downloads](https://img.shields.io/npm/dm/patroon?style=flat-square)](https://www.npmjs.com/package/patroon)
[![100% Code Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen?style=flat-square)](#tests)
[![Dependency Status](https://img.shields.io/librariesio/release/npm/patroon?style=flat-square)](https://libraries.io/npm/patroon)
[![Standard Code Style](https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat-square)](https://standardjs.com)

Pattern matching in JavaScript without additional syntax.

<!-- toc -->

- [Installation](#installation)
- [Usage](#usage)
  * [Primitives](#primitives)
  * [Regular Expressions](#regular-expressions)
  * [Placeholders](#placeholders)
  * [Objects](#objects)
  * [Types](#types)
  * [References](#references)
  * [Arrays](#arrays)
  * [Predicates](#predicates)
  * [Custom Helpers](#custom-helpers)
  * [Errors](#errors)
- [Tests](#tests)
- [Contribute](#contribute)

<!-- tocstop -->

## Installation

[Patroon][9] is hosted on the NPM repository.

```bash
npm install patroon
```

## Usage

Let's see what valid and less valid uses of patroon are.

### Primitives

The simplest thing one can do is to match on a [primitive][1].

Numbers:

```js ./tape-test
patroon(
  2, 3,
  1, 2
)(1)
```
```
2
```

Strings:

```js ./tape-test
patroon(
  'a', 'b',
  'c', 'd'
)('c')
```
```
d
```

Booleans:

```js ./tape-test
patroon(
  true, false,
  false, true
)(true)
```
```
false
```

Symbols:

```js ./tape-test
const a = Symbol('a')
const b = Symbol('b')
const c = Symbol('c')

patroon(
  a, b,
  b, c
)(b)
```
```
Symbol(c)
```

Nil values:

```js ./tape-test
patroon(
  null, undefined,
  undefined, null,
)(undefined)
```
```
null
```

### Regular Expressions

Will check if a Regex matches the passed string using the string's `.test`
method.

```js ./tape-test
patroon(
  /^bunion/, 'string starts with bunion',
  /^banana/, 'string starts with banana'
)('banana tree')
```
```
string starts with banana
```

### Placeholders

The `_` is a placeholder/wildcard value that is useful to implement a default case.

```js ./tape-test
patroon(
  1, 'value is 1',
  'a', 'value is a',
  _, 'value is something else'
)(true)
```
```
value is something else
```

We can combine the `_` with other patroon features.

### Objects

Patroon can help you match **objects** that follow a certain spec.

```js ./tape-test
patroon(
  {b: _}, 'has a "b" property',
  {a: _}, 'has an "a" property'
)({b: 2})
```
```
has a "b" property
```

Next we also match on the key's value.

```js ./tape-test
patroon(
  {a: 1}, 'a is 1',
  {a: 2}, 'a is 2',
  {a: 3}, 'a is 3'
)({a: 2})
```
```
a is 2
```

What about nested objects?

```js ./tape-test
patroon(
  {a: {a: 1}}, 'a.a is 1',
  {a: {a: 2}}, 'a.a is 2',
  {a: {a: 3}}, 'a.a is 3'
)({a: {a: 2}})
```
```
a.a is 2
```

### Types

Sometimes it's nice to know if the value is of a certain type. We'll use the
builtin node error constructors in this example.

```js ./tape-test
patroon(
  TypeError, 'is a type error',
  Error, 'is an error'
)(new Error())
```
```
is an error
```

Patroon uses `instanceof` to match on types.

```js ./tape-test
new TypeError() instanceof Error
```
```
true
```

Because of this you can match a TypeError with an Error.

```js ./tape-test
patroon(
  Error, 'matches on error',
  TypeError, 'matches on type error'
)(new TypeError())
```
```
matches on error
```

An object of a certain type might also have values we would want to match on.
Here you should use the typed helper.

Simply pass a pattern as the second argument of typed.

```js ./tape-test
patroon(
  typed(TypeError, { value: 20 }), 'type error where value is 20',
  typed(Error, { value: 30 }), 'error where value is 30',
  typed(Error, { value: 20 }), 'error where value is 20'
)(Object.assign(new TypeError(), { value: 20 }))
```
```
type error where value is 20
```

Matching on an object type can be written in several ways.

```js ./tape-test > /dev/null
patroon({}, 'is object')({})
patroon(Object, 'is object')({})
patroon(typed(Object), 'is object')({})
```

These are all equivalent.

Arrays can also be matched in a similar way.

```js ./tape-test > /dev/null
patroon([], 'is array')([]),
patroon(Array, 'is array')([]),
patroon(typed(Array), 'is array')([])
```

### References

If you wish to match on the reference of a constructor you can use the `ref`
helper.

```js ./tape-test
patroon(
  Error, 'is an instance of Error',
  ref(Error), 'is the Error constructor'
)(Error)
```
```
is the Error constructor
```

### Arrays

```js ./tape-test
patroon(
  [], 'is an array',
)([1, 2, 3])
```
```
is an array
```

```js ./tape-test
patroon(
  [1], 'is an array that starts with 1',
  [1,2], 'is an array that starts with 1 and 2',
  [], 'is an array',
)([1, 2])
```
```
is an array that starts with 1
```

> Think of patterns as a subset of the value you are trying to match. In the
> case of arrays. `[1,2]` is a subset of `[1,2,3]`. `[2,3]` is not a subset of
> `[1,2,3]` because arrays also care about the order of elements.

A function that looks for a certain pattern in an array:

```js ./tape-test
const containsPattern = patroon(
  [0, 0], true,
  [_, _], ([, ...rest]) => containsPattern(rest),
  [], false
)

containsPattern([1,0,1,0,0])
```
```
true
```

A toPairs function:

```js ./tape-test
const toPairs = patroon(
  [_, _], ([a, b, ...c], p = []) => toPairs(c, [...p, [a, b]]),
  _, (_, p = []) => p
)

toPairs([1, 2, 3, 4])
```
```
[ [ 1, 2 ], [ 3, 4 ] ]
```

> An exercise would be to change toPairs to throw when an uneven length array
> is passed. Multiple answers are possible and some are more optimized than
> others.

### Predicates

By default a function is assumed to be a predicate.

See the [reference][#reference] section if you wish to match on the reference
of the function.

```js ./tape-test
const isTrue = v => v === true

patroon(
  isTrue, 'is true'
)(true)
```
```
is true
```

Could one combine predicates with arrays and objects? Sure one can!

```js ./tape-test
const gt20 = v => v > 20

patroon(
  [[gt20]], 'is greater than 20'
)([[21]])
```
```
is greater than 20
```

```js ./tape-test
const gt42 = v => v > 42

patroon(
  [{a: gt42}], 'is greater than 42'
)([{a: 43}])
```
```
is greater than 42
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

### Errors

Patroon has errors that occur during runtime and when a patroon function is
created. It's important to know when they occur.

#### NoMatchError

The no match error occurs when none of the patterns match the value.

```js { ./tape-test 2>&1 || true; } | head -n 6
const oneIsTwo = patroon(1, 2)

oneIsTwo(3)
```
```
/home/ant/projects/patroon/src/index.js:56
    if (isNil(found)) { throw new NoMatchError(`Not able to match any pattern for value ${JSON.stringify(args)}`) }
                        ^

NoMatchError: Not able to match any pattern for value [3]
    at /home/ant/projects/patroon/src/index.js:56:31
```

#### UnevenArgumentCountError

Another error that occurs is when the patroon function is not used correctly.

```js { ./tape-test 2>&1 || true; } | head -n 6
patroon(1)
```
```
/home/ant/projects/patroon/src/index.js:49
  if (!isEven(list.length)) { throw new UnevenArgumentCountError('Patroon should have an even amount of arguments.') }
                              ^

UnevenArgumentCountError: Patroon should have an even amount of arguments.
    at patroon (/home/ant/projects/patroon/src/index.js:49:37)
```

#### PatroonError

All error patroon produces can be matched against the PatroonError using `instanceof`.

```js
assert.equal(new NoMatchError() instanceof PatroonError, true)
assert.equal(new UnevenArgumentCountError() instanceof PatroonError, true)
```

## Tests

[./src/index.test.js][5] - Contains some tests for edge cases and it defines
some property based tests.

We also care about code coverage so we'll use [nyc][8] to generate a coverage
report.

```bash bash -eo pipefail
# Install and prune dependencies
{ npm i && npm prune; } &> /dev/null

# Run tests and generate a coverage report
npx nyc npm t | npx tap-nyc

# Test if the coverage is 100%
npx nyc check-coverage
```
```
    > patroon@0.1.5 test
    > tape ./src/index.test.js
    -------------|---------|----------|---------|---------|-------------------
    File         | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
    -------------|---------|----------|---------|---------|-------------------
    All files    |     100 |      100 |     100 |     100 |                   
     helpers.js  |     100 |      100 |     100 |     100 |                   
     index.js    |     100 |      100 |     100 |     100 |                   
     walkable.js |     100 |      100 |     100 |     100 |                   
    -------------|---------|----------|---------|---------|-------------------

  total:     5
  passing:   5

  duration:  2.2s

```

## Contribute

You may contribute in whatever manner you see fit. Do try to be helpful and
polite and read the [CONTRIBUTING.md][10].

[7]:https://stackoverflow.com/questions/50452844/functional-programming-style-pattern-matching-in-javascript/67376827#67376827
[8]:https://github.com/istanbuljs/nyc
[9]:https://www.npmjs.com/package/patroon
[10]:./CONTRIBUTING.md
[1]:https://developer.mozilla.org/en-US/docs/Glossary/Primitive
