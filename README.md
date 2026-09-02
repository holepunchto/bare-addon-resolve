# bare-addon-resolve

Low-level addon resolution algorithm for Bare. The algorithm is implemented as a generator function that yields either package manifests to be read or resolution candidates to be tested by the caller. As a convenience, the main export is a synchronous and asynchronous iterable that relies on package manifests being read by a callback. For asynchronous iteration, the callback may return promises which will be awaited before being passed to the generator.

```
npm i bare-addon-resolve
```

## Usage

For synchronous resolution:

```js
const resolve = require('bare-addon-resolve')

function readPackage(url) {
  // Read and parse `url` if it exists, otherwise `null`
}

for (const resolution of resolve('./addon', new URL('file:///directory/'), readPackage)) {
  console.log(resolution)
}
```

For asynchronous resolution:

```js
const resolve = require('bare-addon-resolve')

async function readPackage(url) {
  // Read and parse `url` if it exists, otherwise `null`
}

for await (const resolution of resolve('./addon', new URL('file:///directory/'), readPackage)) {
  console.log(resolution)
}
```

## API

See the [`bare-addon-resolve` reference](https://docs.pears.com/reference/bare/modules/bare-addon-resolve).

## Algorithm

The following generator functions implement the resolution algorithm. The yielded values have the following shape:

**Package manifest**

```js
next.value = {
  package: URL
}
```

If the package manifest identified by `next.value.package` exists, `generator.next()` must be passed the parsed JSON value of the manifest. If it does not exist, pass `null` instead.

**Resolution candidate**

```js
next.value = {
  resolution: URL
}
```

If the addon identified by `next.value.resolution` exists, `generator.next()` may be passed `true` to signal that the resolution for the current set of conditions has been identified. If it does not exist, pass `false` instead.

To drive the generator functions, a loop like the following can be used:

```js
const generator = resolve.addon(specifier, parentURL)

let next = generator.next()

while (next.done !== true) {
  const value = next.value

  if (value.package) {
    // Read and parse `value.package` if it exists, otherwise `null`
    let info

    next = generator.next(info)
  } else {
    const resolution = value.resolution

    // `true` if `resolution` was the correct candidate, otherwise `false`
    let resolved

    next = generator.next(resolved)
  }
}
```

Options are the same as `resolve()` for all functions.

> [!WARNING]
> These functions are currently subject to change between minor releases. If using them directly, make sure to specify a tilde range (`~1.2.3`) when declaring the module dependency.

The `preresolved`, `builtinTarget`, and `lookupPackageScope` generators used by these functions are provided by [`bare-module-resolve`](https://github.com/holepunchto/bare-module-resolve) and behave as documented there.

## License

Apache-2.0
