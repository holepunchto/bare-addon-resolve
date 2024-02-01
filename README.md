# bare-addon-resolve

Low-level addon resolution algorithm for Bare. The algorithm is implemented as a generator function that yields either package manifests to be read or resolution candidates to be tested by the caller. As a convenience, the main export is a synchronous and asynchronous iterable that relies on package manifests being read by a callback. For asynchronous iteration, the callback may return promises which will be awaited before being passed to the generator.

```
npm i bare-addon-resolve
```

## Usage

For synchronous resolution:

``` js
const resolve = require('bare-addon-resolve')

function readPackage (url) {
  // Read and parse `url` if it exists, otherwise `null`
}

for (const resolution of resolve('./addon', new URL('file:///directory/'), readPackage)) {
  console.log(resolution)
}
```

For asynchronous resolution:

``` js
const resolve = require('bare-addon-resolve')

async function readPackage (url) {
  // Read and parse `url` if it exists, otherwise `null`
}

for await (const resolution of resolve('./addon', new URL('file:///directory/'), readPackage)) {
  console.log(resolution)
}
```

## API

#### `const resolver = resolve(specifier, parentURL[, options][, readPackage])`

Resolve `specifier` relative to `parentURL`, which must be a WHATWG `URL` instance. `readPackage` is called with a `URL` instance for every package manifest to be read and must either return the parsed JSON package manifest, if it exists, or `null`. If `readPackage` returns a promise, synchronous iteration is not supported.

Options include:

```js
{
  // The name of the addon. If `null`, it will instead be read from the
  // resolved `package.json`.
  name: null,
  // The version of the addon. If `null`, it will instead be read from the
  // resolved `package.json`.
  version: null,
  // A list of builtin addon specifiers. If matched, the protocol of the
  // resolved URL will be `builtinProtocol`.
  builtins: [],
  // The protocol to use for resolved builtin addon specifiers.
  builtinProtocol: 'builtin:',
  // The `<platform>-<arch>` combination to look for when resolving dynamic
  // addons. If `null`, only builtin specifiers and addons in `prebuilds` can
  // be resolved. In Bare, pass `Bare.Addon.host`.
  host: null,
  // An additional URL to consider when resolving dynamic addons.
  prebuilds: null,
  // The file extensions to look for when resolving dynamic addons.
  extensions: [],
}
```

#### `for (const resolution of resolver)`

Synchronously iterate the addon resolution candidates. The resolved addon is the first candidate that exists as a file on the file system.

#### `for await (const resolution of resolver)`

Asynchronously iterate the addon resolution candidates. If `readPackage` returns promises, these will be awaited. The same comments as `for (const resolution of resolver)` apply.

### Algorithm

The following generator functions implement the resolution algorithm. To drive the generator functions, a loop like the following can be used:

```js
const generator = resolve.addon(specifier, parentURL)

let next = generator.next()

while (next.done !== true) {
  const value = next.value

  if (value.package) {
    const info = /* Read and parse `value.package` if it exists, otherwise `null` */;

    next = generator.next(info)
  } else {
    const resolution = value.addon

    next = generator.next()
  }
}
```

Options are the same as `resolve()` for all functions.

#### `const generator = resolve.addon(specifier, parentURL[, options])`

#### `const generator = resolve.file(filename, parentURL, isIndex[, options])`

## License

Apache-2.0
