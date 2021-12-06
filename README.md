# Patroon

Pattern matching in JavaScript without additional syntax.

[![NPM](https://img.shields.io/npm/v/patroon?color=blue&style=flat-square)](https://www.npmjs.com/package/patroon)
[![NPM Downloads](https://img.shields.io/npm/dm/patroon?style=flat-square)](https://www.npmjs.com/package/patroon)
[![100% Code Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen?style=flat-square)](#tests)
[![Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/patroon?style=flat-square)](https://snyk.io/vuln/npm:patroon)
[![Standard Code Style](https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat-square)](https://standardjs.com)
[![License](https://img.shields.io/npm/l/patroon?color=brightgreen&style=flat-square)](./LICENSE)

- [Installation](#installation)
- [Usage](#usage)
  * [Primitive](#primitive)
  * [Regular Expression](#regular-expression)
  * [Placeholder](#placeholder)
  * [Object](#object)
  * [Instance](#instance)
  * [Reference](#reference)
  * [Array](#array)
  * [Every](#every)
  * [Some](#some)
  * [Multi](#multi)
  * [Predicate](#predicate)
  * [Custom Helper](#custom-helper)
  * [Errors](#errors)
    + [NoMatchError](#nomatcherror)
    + [UnevenArgumentCountError](#unevenargumentcounterror)
    + [PatroonError](#patroonerror)
- [Examples](#examples)
- [Tests](#tests)
- [Contribute](#contribute)
  * [Contributors](#contributors)

## Installation

[Patroon][9] is hosted on the NPM repository.

```bash
npm install patroon
```

## Usage

Let's see what valid and less valid uses of patroon are.

> You can try out patroon over at [RunKit][runkit].

### Primitive

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

### Regular Expression

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

### Placeholder

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

### Object

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

### Instance

Sometimes it's nice to know if the value is of a certain type. We'll use the
builtin node error constructors in this example.

```js ./tape-test
patroon(
  instanceOf(TypeError), 'is a type error',
  instanceOf(Error), 'is an error'
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
  instanceOf(Error), 'matches on error',
  instanceOf(TypeError), 'matches on type error'
)(new TypeError())
```
```
matches on error
```

An object of a certain type might also have values we would want to match on.
Here you should use the every helper.

```js ./tape-test
patroon(
  every(instanceOf(TypeError), { value: 20 }), 'type error where value is 20',
  every(instanceOf(Error), { value: 30 }), 'error where value is 30',
  every(instanceOf(Error), { value: 20 }), 'error where value is 20'
)(Object.assign(new TypeError(), { value: 20 }))
```
```
type error where value is 20
```

Matching on an object type can be written in several ways.

```js ./tape-test > /dev/null
patroon({}, 'is object')({})
patroon(Object, 'is object')({})
```

These are all equivalent.

Arrays can also be matched in a similar way.

```js ./tape-test > /dev/null
patroon([], 'is array')([])
patroon(Array, 'is array')([])
```

A less intuitive case:

```js ./tape-test > /dev/null
patroon({}, 'is object')([])
patroon([], 'is array')({})
```

Patroon allows this because Arrays can have properties defined.

```js ./tape-test > /dev/null
const array = []
array.prop = 42

patroon({prop: _}, 'has prop')(array)
```

The other way around is also allowed even if it seems weird.

```js ./tape-test > /dev/null
const object = {0: 42}
patroon([42], 'has 0th')(object)
```

If you do not desire this loose behavior you can use a predicate to make sure
something is an array or object.

```js ./tape-test > /dev/null
patroon(Array.isArray, 'is array')([])
```

### Reference

If you wish to match on the reference of a constructor you can use the `ref`
helper.

```js ./tape-test
patroon(
  instanceOf(Error), 'is an instance of Error',
  reference(Error), 'is the Error constructor'
)(Error)
```
```
is the Error constructor
```

### Array

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

We can also use an object pattern to match certain indexes. The same can be
written using an array pattern and the `_`. The array pattern can become a bit
verbose when wanting to match on a bigger index.

These two patterns are equivalent:

```js ./tape-test
patroon(
  {6: 7}, 'Index 6 has value 7',
  [_, _, _, _, _, _, 7], 'Index 6 has value 7'
)([1, 2, 3, 4, 5, 6, 7])
```
```
Index 6 has value 7
```

A function that returns the lenght of an array:

```js ./tape-test
const count = patroon(
  [_], ([, ...xs]) => 1 + count(xs),
  [], 0
)

count([0,1,2,3])
```
```
4
```

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

### Every

A helper that makes it easy to check if a value passes all patterns.

```js ./tape-test
const gte200 = x => x >= 200
const lt300 = x => x < 300

patroon(
  every(gte200, lt300), 'Is a 200 status code'
)(200)
```
```
Is a 200 status code
```

### Some

A helper to check if any of the pattern matches value.

```js ./tape-test
const isMovedResponse = patroon(
  {statusCode: some(301, 302, 307, 308)}, true,
  _, false
)

isMovedResponse({statusCode: 301})
```
```
true
```

### Multi

Patroon offers the `multi` function in order to match on the value of another
argument than the first one. This is named [multiple dispatch][2].

```js ./tape-test
  patroon(
    multi(1, 2, 3), 'arguments are 1, 2 and 3'
  )(1, 2, 3)
```
```
arguments are 1, 2 and 3
```

### Predicate

By default a function is assumed to be a predicate.

See the [references](#references) section if you wish to match on the reference
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

### Custom Helper

It is very easy to write your own helpers. All the builtin helpers are really
just predicates. Let's look at the source of one of these helpers, the simplest
one being the `_` helper.

```js ./tape-test
_.toString()
```
```
() => true
```

Other more complex helpers like the `every` or `some` helper are also
predicates.

```js ./tape-test
every.toString()
```
```
(...patterns) => {
  const matches = patterns.map(predicate)

  return (...args) => matches.every(pred => pred(...args))
}
```

See the [./src/index.js][3] if you are interested in the implementation.

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
/home/ant/projects/patroon/src/index.js:96
      throw error
      ^

NoMatchError: Not able to match any pattern for arguments
    at /home/ant/projects/patroon/src/index.js:90:21
```

#### UnevenArgumentCountError

Another error that occurs is when the patroon function is not used correctly.

```js { ./tape-test 2>&1 || true; } | head -n 6
patroon(1)
```
```
/home/ant/projects/patroon/src/index.js:82
  if (!isEven(list.length)) { throw new UnevenArgumentCountError('Patroon should have an even amount of arguments.') }
                              ^

UnevenArgumentCountError: Patroon should have an even amount of arguments.
    at patroon (/home/ant/projects/patroon/src/index.js:82:37)
```

#### PatroonError

All errors patroon produces can be matched against the PatroonError using `instanceof`.

```js ./tape-test
const isPatroonError = patroon(instanceOf(PatroonError), 'patroon is causing an error')

isPatroonError(new NoMatchError())
isPatroonError(new UnevenArgumentCountError())
```
```
patroon is causing an error
```

## Examples

Patroon can be used in any context that can benefit from pattern matching.

- The following tests show how patroon can help you test your JSON API by
  pattern matching on status codes and the body:
  https://github.com/bas080/didomi/blob/master/index.test.js.

## Tests

[./src/index.test.js][5] - Contains some tests for edge cases and it defines
some property based tests.

We also care about code coverage so we'll use [nyc][8] to generate a coverage
report.

```bash bash -eo pipefail
# Clean install dependencies.
npm ci &> /dev/null

# Run tests and generate a coverage report
npx nyc npm t | npx tap-nyc

# Test if the coverage is 100%
npx nyc check-coverage
```
```
    > patroon@1.1.2 test
    > tape ./src/index.test.js
    -------------|---------|----------|---------|---------|-------------------
    File         | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
    -------------|---------|----------|---------|---------|-------------------
    All files    |     100 |      100 |     100 |     100 |                   
     helpers.js  |     100 |      100 |     100 |     100 |                   
     index.js    |     100 |      100 |     100 |     100 |                   
     walkable.js |     100 |      100 |     100 |     100 |                   
    -------------|---------|----------|---------|---------|-------------------

  total:     28
  passing:   28

  duration:  9.5s

```

## Contribute

You may contribute in whatever manner you see fit. Do try to be helpful and
polite and read the [CONTRIBUTING.md][10].

### Contributors

- **Bassim Huis** *https://github.com/bas080*
- **Scott Sauyet** *http://scott.sauyet.com*


[1]:https://developer.mozilla.org/en-US/docs/Glossary/Primitive
[2]:https://en.wikipedia.org/wiki/Multiple_dispatch
[3]:https://github.com/bas080/patroon/blob/master/src/index.js
[5]:./src/index.test.js
[7]:https://stackoverflow.com/questions/50452844/functional-programming-style-pattern-matching-in-javascript/67376827#67376827
[8]:https://github.com/istanbuljs/nyc
[9]:https://www.npmjs.com/package/patroon
[10]:./CONTRIBUTING.md
[runkit]:https://npm.runkit.com/patroon
