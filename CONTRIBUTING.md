# Contributing

## Implementation

1. [./src/walkable.js][2] - Patroon allows one to define deeply nested
   patterns. To implement these features succinctly we use an abstraction
   which allows the traversing of a tree. This is an area of computer science
   named [tree traversal][1].
2. [./src/index.js][3] - We now take the walkable utility and implement
   patroon's functionality.
3. [./src/helpers.js][4] - You might have noticed that both the patroon and
   walkable modules have common helper functions.

## Formatting

Standard is good enough.

```bash
npx standard
```

## Documentation

We generate the contributors list using node and store it in [memplate][7].

```js
require('./package.json').contributors.reduce((acc, {name, url, email}) =>
  `${acc}- **${name}** *${url}*\n`, '')
```

We also generate the table of contents and store it in memplate.

```bash
npx markdown-toc --no-firsth1 --maxdepth 4 README.mz
```

For the tests in the README.mz to work we also need to install patroon.

```bash
npm link
npm link patroon
```
```

up to date, audited 3 packages in 939ms

found 0 vulnerabilities

added 1 package, and audited 95 packages in 936ms

65 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

We then use memplate to template the README. Then we run [markatzea][6] to run
the examples and show the output of those.

```bash
memplate < README.mz | markatzea > README.md
echo 'Documentation generated successfully.' 1>&2
```

## Changelog

The [changelog][changelog] is generated using the useful [auto-changelog][auto-changelog]
project.

```bash
npx auto-changelog -p
```

[1]:https://en.wikipedia.org/wiki/Tree_traversal
[2]:https://github.com/bas080/patroon/blob/master/src/walkable.js
[3]:https://github.com/bas080/patroon/blob/master/src/index.js
[4]:https://github.com/bas080/patroon/blob/master/src/helpers.js
[6]:https://github.com/bas080/markatzea
[7]:https://github.com/bas080/memplate
[changelog]:./CHANGELOG.md
[auto-changelog]:https://www.npmjs.com/package/auto-changelog
