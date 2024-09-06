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
  if (exports.startsWithWindowsDriveLetter(specifier)) {
    specifier = '/' + specifier
  }

  if (specifier === '.' || specifier === '..' || specifier[0] === '/' || specifier[0] === '\\' || specifier.startsWith('./') || specifier.startsWith('.\\') || specifier.startsWith('../') || specifier.startsWith('..\\')) {
    return yield * exports.directory(specifier, parentURL, opts)
  }

  return yield * exports.package(specifier, parentURL, opts)
}

exports.package = function * (packageSpecifier, parentURL, opts = {}) {
  let packageName

  if (packageSpecifier === '') {
    throw errors.INVALID_ADDON_SPECIFIER(`Addon specifier '${packageSpecifier}' is not a valid package name`)
  }

  if (packageSpecifier[0] !== '@') {
    packageName = packageSpecifier.split('/', 1).join()
  } else {
    if (!packageSpecifier.includes('/')) {
      throw errors.INVALID_ADDON_SPECIFIER(`Addon specifier '${packageSpecifier}' is not a valid package name`)
    }

    packageName = packageSpecifier.split('/', 2).join('/')
  }

  if (packageName[0] === '.' || packageName.includes('\\') || packageName.includes('%')) {
    throw errors.INVALID_ADDON_SPECIFIER(`Addon specifier '${packageSpecifier}' is not a valid package name`)
  }

  const packageSubpath = '.' + packageSpecifier.substring(packageName.length)

  if (yield * exports.packageSelf(packageName, packageSubpath, parentURL, opts)) {
    return true
  }

  parentURL = new URL(parentURL.href)

  do {
    const packageURL = new URL('node_modules/' + packageName + '/', parentURL)

    parentURL.pathname = parentURL.pathname.substring(0, parentURL.pathname.lastIndexOf('/'))

    const info = yield { package: new URL('package.json', packageURL) }

    if (info) {
      return yield * exports.directory(packageSubpath, packageURL, opts)
    }
  } while (parentURL.pathname !== '/')

  return false
}

exports.packageSelf = function * (packageName, packageSubpath, parentURL, opts = {}) {
  for (const packageURL of resolve.lookupPackageScope(parentURL, opts)) {
    const info = yield { package: packageURL }

    if (info) {
      if (info.name === packageName) {
        return yield * exports.directory(packageSubpath, packageURL, opts)
      }

      break
    }
  }

  return false
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

exports.directory = function * (dirname, parentURL, opts = {}) {
  const { builtins = [], builtinProtocol = 'builtin:', resolutions = null } = opts

  let directoryURL

  if (dirname[dirname.length - 1] === '/' || dirname[dirname.length - 1] === '\\') {
    directoryURL = new URL(dirname, parentURL)
  } else {
    directoryURL = new URL(dirname + '/', parentURL)
  }

  if (resolutions) {
    if (yield * exports.preresolved(directoryURL, resolutions, opts)) {
      return true
    }
  }

  let name = null
  let version = null

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

  if (yield * exports.linked(name, version, opts)) {
    yielded = true
  }

  return yielded
}

exports.linked = function * (name, version = null, opts = {}) {
  const { linked = true, linkedProtocol = 'linked:', host = null } = opts

  if (linked === false || host === null) return false

  if (host.startsWith('darwin-')) {
    if (version !== null) {
      yield { resolution: new URL(linkedProtocol + 'lib' + name + '.' + version + '.dylib') }
      yield { resolution: new URL(linkedProtocol + name + '.' + version + '.framework/' + name + '.' + version) }
    }

    yield { resolution: new URL(linkedProtocol + 'lib' + name + '.dylib') }
    yield { resolution: new URL(linkedProtocol + name + '.framework/' + name) }

    return true
  }

  if (host.startsWith('ios-')) {
    if (version !== null) {
      yield { resolution: new URL(linkedProtocol + name + '.' + version + '.framework/' + name + '.' + version) }
    }

    yield { resolution: new URL(linkedProtocol + name + '.framework/' + name) }

    return true
  }

  if (host.startsWith('linux-') || host.startsWith('android-')) {
    if (version !== null) {
      yield { resolution: new URL(linkedProtocol + 'lib' + name + '.' + version + '.so') }
    }

    yield { resolution: new URL(linkedProtocol + 'lib' + name + '.so') }

    return true
  }

  if (host.startsWith('win32-')) {
    if (version !== null) {
      yield { resolution: new URL(linkedProtocol + name + '-' + version + '.dll') }
    }

    yield { resolution: new URL(linkedProtocol + name + '.dll') }

    return true
  }

  return false
}

exports.isWindowsDriveLetter = resolve.isWindowsDriveLetter

exports.startsWithWindowsDriveLetter = resolve.startsWithWindowsDriveLetter
