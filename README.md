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

<!-- bare-refgen:api start -->

## API

### Functions

#### `resolve`

```ts
resolve(specifier: string, parentURL: URL, readPackage?: (url: URL) => JSON | null): Iterable<URL>
```

[source](https://github.com/holepunchto/bare-addon-resolve/blob/v1.10.0/index.d.ts#L19)

Resolve `specifier` relative to `parentURL`, which must be a WHATWG `URL` instance. `readPackage` is called with a `URL` instance for every package manifest to be read and must either return the parsed JSON package manifest, if it exists, or `null`. If `readPackage` returns a promise, synchronous iteration is not supported.

**Parameters**

| Parameter      | Type                         | Default | Description                                                                                                                                              |
| -------------- | ---------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `specifier`    | `string`                     | —       | The module specifier to resolve.                                                                                                                         |
| `parentURL`    | `URL`                        | —       | The URL to resolve `specifier` relative to.                                                                                                              |
| `readPackage?` | `(url: URL) => JSON \| null` | —       | Called with the URL of each package manifest encountered; must return the parsed manifest or `null`. Returning a promise disables synchronous iteration. |

**Returns** `Iterable<URL>` — Yields candidate resolution `URL`s for the caller to test, in the order the algorithm tries them.

**Throws**

- `INVALID_ADDON_SPECIFIER` — the addon specifier is not a valid package name or contains an invalid escape sequence.
- `INVALID_PACKAGE_NAME` — a package manifest's `name` field is invalid (e.g. contains `__`).

### Types

#### `ResolveOptions`

```ts
interface ResolveOptions {
  builtinProtocol?: string
  builtins?: Builtins
  conditions?: Conditions
  extensions?: string[]
  host?: string
  hosts?: string[]
  linked?: boolean
  linkedProtocol?: string
  matchedConditions?: string[]
  resolutions?: ResolutionsMap
}
```

[source](https://github.com/holepunchto/bare-addon-resolve/blob/v1.10.0/index.d.ts#L6)

## `bare-addon-resolve/errors`

### AddonResolveError

#### `AddonResolveError.INVALID_ADDON_SPECIFIER(msg: string): AddonResolveError`

[source](https://github.com/holepunchto/bare-addon-resolve/blob/v1.10.0/lib/errors.d.ts#L4)

**Parameters**

| Parameter | Type     | Default | Description        |
| --------- | -------- | ------- | ------------------ |
| `msg`     | `string` | —       | The error message. |

**Returns** `AddonResolveError` — A new `AddonResolveError` with code `INVALID_ADDON_SPECIFIER`.

#### `AddonResolveError.INVALID_PACKAGE_NAME(msg: string): AddonResolveError`

[source](https://github.com/holepunchto/bare-addon-resolve/blob/v1.10.0/lib/errors.d.ts#L5)

**Parameters**

| Parameter | Type     | Default | Description        |
| --------- | -------- | ------- | ------------------ |
| `msg`     | `string` | —       | The error message. |

**Returns** `AddonResolveError` — A new `AddonResolveError` with code `INVALID_PACKAGE_NAME`.

#### `code: string`

[source](https://github.com/holepunchto/bare-addon-resolve/blob/v1.10.0/lib/errors.d.ts#L2)

<!-- bare-refgen:api end -->

## License

Apache-2.0
