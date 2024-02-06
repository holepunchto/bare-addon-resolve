const resolve = require('bare-module-resolve')
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
          yield value.resolution
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
          yield value.resolution
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
  let { name = null, version = null, builtins = [], builtinProtocol = 'builtin:', resolutions = null } = opts

  if (exports.startsWithWindowsDriveLetter(specifier)) {
    specifier = '/' + specifier
  }

  let directoryURL

  if (specifier[specifier.length - 1] === '/' || specifier[specifier.length - 1] === '\\') {
    directoryURL = new URL(specifier, parentURL)
  } else {
    directoryURL = new URL(specifier + '/', parentURL)
  }

  if (resolutions) {
    if (yield * exports.preresolved(directoryURL, resolutions, opts)) {
      return true
    }
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

  if (version !== null) {
    if (builtins.includes(name + '@' + version)) {
      yield { resolution: new URL(builtinProtocol + name + '@' + version) }

      return true
    }
  }

  if (builtins.includes(name)) {
    yield { resolution: new URL(builtinProtocol + name) }

    return true
  }

  let yielded = false

  for (const prebuildsURL of exports.lookupPrebuildsScope(directoryURL, opts)) {
    if (version !== null) {
      if (yield * exports.file(name + '@' + version, prebuildsURL, opts)) {
        yielded = true
      }
    }

    if (yield * exports.file(name, prebuildsURL, opts)) {
      yielded = true
    }
  }

  return yielded
}

exports.preresolved = function * (directoryURL, resolutions, opts = {}) {
  const imports = resolutions[directoryURL.href]

  if (typeof imports === 'object' && imports !== null) {
    return yield * resolve.packageImportsExports('bare:addon', imports, directoryURL, true, opts)
  }

  return false
}

exports.lookupPrebuildsScope = function * lookupPrebuildsScope (url, opts = {}) {
  const { host = null } = opts

  if (host === null) return

  const scopeURL = new URL(url.href)

  do {
    yield new URL('prebuilds/' + host + '/', scopeURL)

    scopeURL.pathname = scopeURL.pathname.substring(0, scopeURL.pathname.lastIndexOf('/'))

    if (scopeURL.pathname.length === 3 && exports.isWindowsDriveLetter(scopeURL.pathname.substring(1))) break
  } while (scopeURL.pathname !== '/')
}

exports.file = function * (filename, parentURL, opts = {}) {
  if (parentURL.protocol === 'file:' && /%2f|%5c/i.test(filename)) {
    throw errors.INVALID_ADDON_SPECIFIER(`Addon specifier '${filename}' is invalid`)
  }

  const { extensions = [] } = opts

  for (const ext of extensions) {
    yield { resolution: new URL(filename + ext, parentURL) }
  }

  return extensions.length > 0
}

exports.isWindowsDriveLetter = resolve.isWindowsDriveLetter

exports.startsWithWindowsDriveLetter = resolve.startsWithWindowsDriveLetter
