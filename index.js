const errors = require('./lib/errors')

module.exports = exports = function resolve (specifier, parentURL, opts, readPackage) {
  if (typeof opts === 'function') {
    readPackage = opts
    opts = {}
  } else if (typeof readPackage !== 'function') {
    readPackage = defaultReadPackage
  }

  return {
    * [Symbol.iterator] () {
      const generator = exports.addon(specifier, parentURL, opts)

      let next = generator.next()

      while (next.done !== true) {
        const value = next.value

        if (value.package) {
          next = generator.next(readPackage(value.package))
        } else {
          yield value.addon
          next = generator.next()
        }
      }

      return next.value
    },

    async * [Symbol.asyncIterator] () {
      const generator = exports.addon(specifier, parentURL, opts)

      let next = generator.next()

      while (next.done !== true) {
        const value = next.value

        if (value.package) {
          next = generator.next(await readPackage(value.package))
        } else {
          yield value.addon
          next = generator.next()
        }
      }

      return next.value
    }
  }
}

function defaultReadPackage () {
  return null
}

exports.addon = function * (specifier, parentURL, opts = {}) {
  let { name = null, version = null, builtins = [], builtinProtocol = 'builtin:' } = opts

  if (exports.startsWithWindowsDriveLetter(specifier)) {
    specifier = '/' + specifier
  }

  let directoryURL

  if (specifier[specifier.length - 1] === '/' || specifier[specifier.length - 1] === '\\') {
    directoryURL = new URL(specifier, parentURL)
  } else {
    directoryURL = new URL(specifier + '/', parentURL)
  }

  if (name === null) {
    const info = yield { package: new URL('package.json', directoryURL) }

    if (info) {
      if (typeof info.name === 'string' && info.name !== '') {
        name = info.name.replace(/\//g, '+')
      } else {
        return false
      }

      if (typeof info.version === 'string' && info.version !== '') {
        version = info.version
      }
    } else {
      return false
    }
  }

  if (builtins.includes(name)) {
    yield { addon: new URL(builtinProtocol + name) }

    return true
  }

  let yielded = false

  for (const prebuildsURL of exports.lookupPrebuildsScope(directoryURL, opts)) {
    if (yield * exports.file(name, prebuildsURL, opts)) {
      yielded = true
    }

    if (version !== null) {
      if (yield * exports.file(name + '@' + version, prebuildsURL, opts)) {
        yielded = true
      }
    }
  }

  return yielded
}

exports.lookupPrebuildsScope = function * lookupPrebuildsScope (url, opts = {}) {
  const { prebuilds = null, host = null } = opts

  if (host) yield new URL('prebuilds/' + host + '/', url)

  if (prebuilds) yield prebuilds
}

exports.file = function * (filename, parentURL, opts = {}) {
  if (parentURL.protocol === 'file:' && /%2f|%5c/i.test(filename)) {
    throw errors.INVALID_ADDON_SPECIFIER(`Addon specifier '${filename}' is invalid`)
  }

  const { extensions = [] } = opts

  for (const ext of extensions) {
    yield { addon: new URL(filename + ext, parentURL) }
  }

  return extensions.length > 0
}

// https://infra.spec.whatwg.org/#ascii-upper-alpha
function isASCIIUpperAlpha (c) {
  return c >= 0x41 && c <= 0x5a
}

// https://infra.spec.whatwg.org/#ascii-lower-alpha
function isASCIILowerAlpha (c) {
  return c >= 0x61 && c <= 0x7a
}

// https://infra.spec.whatwg.org/#ascii-alpha
function isASCIIAlpha (c) {
  return isASCIIUpperAlpha(c) || isASCIILowerAlpha(c)
}

// https://url.spec.whatwg.org/#windows-drive-letter
exports.isWindowsDriveLetter = function isWindowsDriveLetter (input) {
  return input.length >= 2 && isASCIIAlpha(input.charCodeAt(0)) && (
    input.charCodeAt(1) === 0x3a ||
    input.charCodeAt(1) === 0x7c
  )
}

// https://url.spec.whatwg.org/#start-with-a-windows-drive-letter
exports.startsWithWindowsDriveLetter = function startsWithWindowsDriveLetter (input) {
  return input.length >= 2 && exports.isWindowsDriveLetter(input) && (
    input.length === 2 ||
    input.charCodeAt(2) === 0x2f ||
    input.charCodeAt(2) === 0x5c ||
    input.charCodeAt(2) === 0x3f ||
    input.charCodeAt(2) === 0x23
  )
}
