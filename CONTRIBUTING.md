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

```bash bash 2>&1
npx standard || npx standard --fix
```

## Documentation

The README.md is generated using [markatzea][6].

```bash bash
markatzea README.mz > README.md
```

[1]:https://en.wikipedia.org/wiki/Tree_traversal
[2]:https://github.com/bas080/patroon/blob/master/src/walkable.js
[3]:https://github.com/bas080/patroon/blob/master/src/index.js
[4]:https://github.com/bas080/patroon/blob/master/src/helpers.js
[6]:https://github.com/bas080/markatzea
