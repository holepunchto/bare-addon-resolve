const resolve = require('bare-module-resolve')
const { Version } = require('bare-semver')
const errors = require('./lib/errors')

module.exports = exports = function resolve(
  specifier,
  parentURL,
  opts,
  readPackage
) {
  if (typeof opts === 'function') {
    readPackage = opts
    opts = {}
  } else if (typeof readPackage !== 'function') {
    readPackage = defaultReadPackage
  }

  return {
    *[Symbol.iterator]() {
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

    async *[Symbol.asyncIterator]() {
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

function defaultReadPackage() {
  return null
}

exports.addon = function* (specifier, parentURL, opts = {}) {
  const { resolutions = null } = opts

  if (exports.startsWithWindowsDriveLetter(specifier)) {
    specifier = '/' + specifier
  }

  if (resolutions) {
    if (yield* resolve.preresolved(specifier, resolutions, parentURL, opts)) {
      return true
    }
  }

  if (yield* exports.url(specifier, parentURL, opts)) {
    return true
  }

  let version = null

  const i = specifier.lastIndexOf('@')

  if (i > 0) {
    version = specifier.substring(i + 1)

    try {
      Version.parse(version)

      specifier = specifier.substring(0, i)
    } catch {
      version = null
    }
  }

  if (
    specifier === '.' ||
    specifier === '..' ||
    specifier[0] === '/' ||
    specifier[0] === '\\' ||
    specifier.startsWith('./') ||
    specifier.startsWith('.\\') ||
    specifier.startsWith('../') ||
    specifier.startsWith('..\\')
  ) {
    return yield* exports.directory(specifier, version, parentURL, opts)
  }

  return yield* exports.package(specifier, version, parentURL, opts)
}

exports.url = function* (url, parentURL, opts = {}) {
  let resolution
  try {
    resolution = new URL(url)
  } catch {
    return false
  }

  yield { resolution }

  return true
}

exports.package = function* (
  packageSpecifier,
  packageVersion,
  parentURL,
  opts = {}
) {
  if (packageSpecifier === '') {
    throw errors.INVALID_ADDON_SPECIFIER(
      `Addon specifier '${packageSpecifier}' is not a valid package name`
    )
  }

  let packageName

  if (packageSpecifier[0] !== '@') {
    packageName = packageSpecifier.split('/', 1).join()
  } else {
    if (!packageSpecifier.includes('/')) {
      throw errors.INVALID_ADDON_SPECIFIER(
        `Addon specifier '${packageSpecifier}' is not a valid package name`
      )
    }

    packageName = packageSpecifier.split('/', 2).join('/')
  }

  if (
    packageName[0] === '.' ||
    packageName.includes('\\') ||
    packageName.includes('%')
  ) {
    throw errors.INVALID_ADDON_SPECIFIER(
      `Addon specifier '${packageSpecifier}' is not a valid package name`
    )
  }

  const packageSubpath = '.' + packageSpecifier.substring(packageName.length)

  if (
    yield* exports.packageSelf(
      packageName,
      packageSubpath,
      packageVersion,
      parentURL,
      opts
    )
  ) {
    return true
  }

  parentURL = new URL(parentURL.href)

  do {
    const packageURL = new URL('node_modules/' + packageName + '/', parentURL)

    parentURL.pathname = parentURL.pathname.substring(
      0,
      parentURL.pathname.lastIndexOf('/')
    )

    const info = yield { package: new URL('package.json', packageURL) }

    if (info) {
      return yield* exports.directory(
        packageSubpath,
        packageVersion,
        packageURL,
        opts
      )
    }
  } while (parentURL.pathname !== '' && parentURL.pathname !== '/')

  return false
}

exports.packageSelf = function* (
  packageName,
  packageSubpath,
  packageVersion,
  parentURL,
  opts = {}
) {
  for (const packageURL of resolve.lookupPackageScope(parentURL, opts)) {
    const info = yield { package: packageURL }

    if (info) {
      if (info.name === packageName) {
        return yield* exports.directory(
          packageSubpath,
          packageVersion,
          packageURL,
          opts
        )
      }

      break
    }
  }

  return false
}

exports.lookupPrebuildsScope = function* lookupPrebuildsScope(url, opts = {}) {
  const { resolutions = null, host = null } = opts

  if (resolutions) {
    for (const { resolution } of resolve.preresolved(
      '#prebuilds',
      resolutions,
      url,
      opts
    )) {
      if (resolution) return yield resolution
    }
  }

  if (host === null) return

  const scopeURL = new URL(url.href)

  do {
    yield new URL('prebuilds/' + host + '/', scopeURL)

    scopeURL.pathname = scopeURL.pathname.substring(
      0,
      scopeURL.pathname.lastIndexOf('/')
    )

    if (
      scopeURL.pathname.length === 3 &&
      exports.isWindowsDriveLetter(scopeURL.pathname.substring(1))
    )
      break
  } while (scopeURL.pathname !== '' && scopeURL.pathname !== '/')
}

exports.file = function* (filename, parentURL, opts = {}) {
  if (parentURL.protocol === 'file:' && /%2f|%5c/i.test(filename)) {
    throw errors.INVALID_ADDON_SPECIFIER(
      `Addon specifier '${filename}' is invalid`
    )
  }

  const { extensions = [] } = opts

  for (const ext of extensions) {
    yield { resolution: new URL(filename + ext, parentURL) }
  }

  return extensions.length > 0
}

exports.directory = function* (dirname, version, parentURL, opts = {}) {
  const { resolutions = null, builtins = [] } = opts

  let directoryURL

  if (
    dirname[dirname.length - 1] === '/' ||
    dirname[dirname.length - 1] === '\\'
  ) {
    directoryURL = new URL(dirname, parentURL)
  } else {
    directoryURL = new URL(dirname + '/', parentURL)
  }

  // Internal preresolution path, do not depend on this! It will be removed without
  // warning.
  if (resolutions) {
    if (
      yield* resolve.preresolved('bare:addon', resolutions, directoryURL, opts)
    ) {
      return true
    }
  }

  const unversioned = version === null

  let name = null

  const info = yield { package: new URL('package.json', directoryURL) }

  if (info) {
    if (typeof info.name === 'string' && info.name !== '') {
      name = info.name.replace(/\//g, '+')
    } else {
      return false
    }

    if (typeof info.version === 'string' && info.version !== '') {
      if (version !== null && info.version !== version) return false

      version = info.version
    }
  } else {
    return false
  }

  if (yield* resolve.builtinTarget(name, version, builtins, opts)) {
    return true
  }

  let yielded = false

  for (const prebuildsURL of exports.lookupPrebuildsScope(directoryURL, opts)) {
    if (version !== null) {
      if (yield* exports.file(name + '@' + version, prebuildsURL, opts)) {
        yielded = true
      }
    }

    if (unversioned) {
      if (yield* exports.file(name, prebuildsURL, opts)) {
        yielded = true
      }
    }
  }

  if (yield* exports.linked(name, version, opts)) {
    yielded = true
  }

  return yielded
}

exports.linked = function* (name, version = null, opts = {}) {
  const { linked = true, linkedProtocol = 'linked:', host = null } = opts

  if (linked === false || host === null) return false

  if (host.startsWith('darwin-')) {
    if (version !== null) {
      yield {
        resolution: new URL(
          linkedProtocol + 'lib' + name + '.' + version + '.dylib'
        )
      }
      yield {
        resolution: new URL(
          linkedProtocol +
            name +
            '.' +
            version +
            '.framework/' +
            name +
            '.' +
            version
        )
      }
    }

    yield { resolution: new URL(linkedProtocol + 'lib' + name + '.dylib') }
    yield { resolution: new URL(linkedProtocol + name + '.framework/' + name) }

    return true
  }

  if (host.startsWith('ios-')) {
    if (version !== null) {
      yield {
        resolution: new URL(
          linkedProtocol +
            name +
            '.' +
            version +
            '.framework/' +
            name +
            '.' +
            version
        )
      }
    }

    yield { resolution: new URL(linkedProtocol + name + '.framework/' + name) }

    return true
  }

  if (host.startsWith('linux-') || host.startsWith('android-')) {
    if (version !== null) {
      yield {
        resolution: new URL(
          linkedProtocol + 'lib' + name + '.' + version + '.so'
        )
      }
    }

    yield { resolution: new URL(linkedProtocol + 'lib' + name + '.so') }

    return true
  }

  if (host.startsWith('win32-')) {
    if (version !== null) {
      yield {
        resolution: new URL(linkedProtocol + name + '-' + version + '.dll')
      }
    }

    yield { resolution: new URL(linkedProtocol + name + '.dll') }

    return true
  }

  return false
}

exports.isWindowsDriveLetter = resolve.isWindowsDriveLetter

exports.startsWithWindowsDriveLetter = resolve.startsWithWindowsDriveLetter
