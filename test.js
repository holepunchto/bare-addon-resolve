const test = require('brittle')
const resolve = require('.')

const host = 'host'

test('bare specifier, pkg.name', (t) => {
  function readPackage(url) {
    if (url.href === 'file:///a/b/node_modules/d/package.json') {
      return {
        name: 'd'
      }
    }

    return null
  }

  const result = []

  for (const resolution of resolve(
    'd',
    new URL('file:///a/b/c'),
    { host, extensions: ['.bare'] },
    readPackage
  )) {
    result.push(resolution.href)
  }

  t.alike(result, [
    `file:///a/b/node_modules/d/prebuilds/${host}/d.bare`,
    `file:///a/b/node_modules/prebuilds/${host}/d.bare`,
    `file:///a/b/prebuilds/${host}/d.bare`,
    `file:///a/prebuilds/${host}/d.bare`,
    `file:///prebuilds/${host}/d.bare`
  ])
})

test('bare specifier, pkg.name + pkg.version', (t) => {
  function readPackage(url) {
    if (url.href === 'file:///a/b/node_modules/d/package.json') {
      return {
        name: 'd',
        version: '1.2.3'
      }
    }

    return null
  }

  const result = []

  for (const resolution of resolve(
    'd',
    new URL('file:///a/b/c'),
    { host, extensions: ['.bare'] },
    readPackage
  )) {
    result.push(resolution.href)
  }

  t.alike(result, [
    `file:///a/b/node_modules/d/prebuilds/${host}/d@1.2.3.bare`,
    `file:///a/b/node_modules/d/prebuilds/${host}/d.bare`,
    `file:///a/b/node_modules/prebuilds/${host}/d@1.2.3.bare`,
    `file:///a/b/node_modules/prebuilds/${host}/d.bare`,
    `file:///a/b/prebuilds/${host}/d@1.2.3.bare`,
    `file:///a/b/prebuilds/${host}/d.bare`,
    `file:///a/prebuilds/${host}/d@1.2.3.bare`,
    `file:///a/prebuilds/${host}/d.bare`,
    `file:///prebuilds/${host}/d@1.2.3.bare`,
    `file:///prebuilds/${host}/d.bare`
  ])
})

test('bare specifier, scoped pkg.name', (t) => {
  function readPackage(url) {
    if (url.href === 'file:///a/b/node_modules/@d/e/package.json') {
      return {
        name: '@d/e'
      }
    }

    return null
  }

  const result = []

  for (const resolution of resolve(
    '@d/e',
    new URL('file:///a/b/c'),
    { host, extensions: ['.bare'] },
    readPackage
  )) {
    result.push(resolution.href)
  }

  t.alike(result, [
    `file:///a/b/node_modules/@d/e/prebuilds/${host}/d+e.bare`,
    `file:///a/b/node_modules/@d/prebuilds/${host}/d+e.bare`,
    `file:///a/b/node_modules/prebuilds/${host}/d+e.bare`,
    `file:///a/b/prebuilds/${host}/d+e.bare`,
    `file:///a/prebuilds/${host}/d+e.bare`,
    `file:///prebuilds/${host}/d+e.bare`
  ])
})

test('bare specifier, scoped pkg.name + pkg.version', (t) => {
  function readPackage(url) {
    if (url.href === 'file:///a/b/node_modules/@d/e/package.json') {
      return {
        name: '@d/e',
        version: '1.2.3'
      }
    }

    return null
  }

  const result = []

  for (const resolution of resolve(
    '@d/e',
    new URL('file:///a/b/c'),
    { host, extensions: ['.bare'] },
    readPackage
  )) {
    result.push(resolution.href)
  }

  t.alike(result, [
    `file:///a/b/node_modules/@d/e/prebuilds/${host}/d+e@1.2.3.bare`,
    `file:///a/b/node_modules/@d/e/prebuilds/${host}/d+e.bare`,
    `file:///a/b/node_modules/@d/prebuilds/${host}/d+e@1.2.3.bare`,
    `file:///a/b/node_modules/@d/prebuilds/${host}/d+e.bare`,
    `file:///a/b/node_modules/prebuilds/${host}/d+e@1.2.3.bare`,
    `file:///a/b/node_modules/prebuilds/${host}/d+e.bare`,
    `file:///a/b/prebuilds/${host}/d+e@1.2.3.bare`,
    `file:///a/b/prebuilds/${host}/d+e.bare`,
    `file:///a/prebuilds/${host}/d+e@1.2.3.bare`,
    `file:///a/prebuilds/${host}/d+e.bare`,
    `file:///prebuilds/${host}/d+e@1.2.3.bare`,
    `file:///prebuilds/${host}/d+e.bare`
  ])
})

test('versioned bare specifier, pkg.name', (t) => {
  function readPackage(url) {
    if (url.href === 'file:///a/b/node_modules/d/package.json') {
      return {
        name: 'd'
      }
    }

    return null
  }

  const result = []

  for (const resolution of resolve(
    'd@1.2.3',
    new URL('file:///a/b/c'),
    { host, extensions: ['.bare'] },
    readPackage
  )) {
    result.push(resolution.href)
  }

  t.alike(result, [
    `file:///a/b/node_modules/d/prebuilds/${host}/d@1.2.3.bare`,
    `file:///a/b/node_modules/prebuilds/${host}/d@1.2.3.bare`,
    `file:///a/b/prebuilds/${host}/d@1.2.3.bare`,
    `file:///a/prebuilds/${host}/d@1.2.3.bare`,
    `file:///prebuilds/${host}/d@1.2.3.bare`
  ])
})

test('versioned bare specifier, pkg.name + pkg.version', (t) => {
  function readPackage(url) {
    if (url.href === 'file:///a/b/node_modules/d/package.json') {
      return {
        name: 'd',
        version: '1.2.3'
      }
    }

    return null
  }

  const result = []

  for (const resolution of resolve(
    'd@1.2.3',
    new URL('file:///a/b/c'),
    { host, extensions: ['.bare'] },
    readPackage
  )) {
    result.push(resolution.href)
  }

  t.alike(result, [
    `file:///a/b/node_modules/d/prebuilds/${host}/d@1.2.3.bare`,
    `file:///a/b/node_modules/prebuilds/${host}/d@1.2.3.bare`,
    `file:///a/b/prebuilds/${host}/d@1.2.3.bare`,
    `file:///a/prebuilds/${host}/d@1.2.3.bare`,
    `file:///prebuilds/${host}/d@1.2.3.bare`
  ])
})

test('versioned bare specifier, pkg.name + pkg.version, version mismatch', (t) => {
  function readPackage(url) {
    if (url.href === 'file:///a/b/node_modules/d/package.json') {
      return {
        name: 'd',
        version: '1.2.3'
      }
    }

    return null
  }

  const result = []

  for (const resolution of resolve(
    'd@1.2.4',
    new URL('file:///a/b/c'),
    { host, extensions: ['.bare'] },
    readPackage
  )) {
    result.push(resolution.href)
  }

  t.alike(result, [])
})

test('bare specifier with scope and no version', (t) => {
  function readPackage(url) {
    if (url.href === 'file:///a/b/node_modules/@d/e/package.json') {
      return {
        name: 'e'
      }
    }

    return null
  }

  const result = []

  for (const resolution of resolve(
    '@d/e',
    new URL('file:///a/b/c'),
    { host, extensions: ['.bare'] },
    readPackage
  )) {
    result.push(resolution.href)
  }

  t.alike(result, [
    `file:///a/b/node_modules/@d/e/prebuilds/${host}/e.bare`,
    `file:///a/b/node_modules/@d/prebuilds/${host}/e.bare`,
    `file:///a/b/node_modules/prebuilds/${host}/e.bare`,
    `file:///a/b/prebuilds/${host}/e.bare`,
    `file:///a/prebuilds/${host}/e.bare`,
    `file:///prebuilds/${host}/e.bare`
  ])
})

test('relative specifier, pkg.name', (t) => {
  function readPackage(url) {
    if (url.href === 'file:///a/b/d/package.json') {
      return {
        name: 'd'
      }
    }

    return null
  }

  const result = []

  for (const resolution of resolve(
    './d',
    new URL('file:///a/b/c'),
    { host, extensions: ['.bare'] },
    readPackage
  )) {
    result.push(resolution.href)
  }

  t.alike(result, [
    `file:///a/b/d/prebuilds/${host}/d.bare`,
    `file:///a/b/prebuilds/${host}/d.bare`,
    `file:///a/prebuilds/${host}/d.bare`,
    `file:///prebuilds/${host}/d.bare`
  ])
})

test('relative specifier, pkg.name + pkg.version', (t) => {
  function readPackage(url) {
    if (url.href === 'file:///a/b/d/package.json') {
      return {
        name: 'd',
        version: '1.2.3'
      }
    }

    return null
  }

  const result = []

  for (const resolution of resolve(
    './d',
    new URL('file:///a/b/c'),
    { host, extensions: ['.bare'] },
    readPackage
  )) {
    result.push(resolution.href)
  }

  t.alike(result, [
    `file:///a/b/d/prebuilds/${host}/d@1.2.3.bare`,
    `file:///a/b/d/prebuilds/${host}/d.bare`,
    `file:///a/b/prebuilds/${host}/d@1.2.3.bare`,
    `file:///a/b/prebuilds/${host}/d.bare`,
    `file:///a/prebuilds/${host}/d@1.2.3.bare`,
    `file:///a/prebuilds/${host}/d.bare`,
    `file:///prebuilds/${host}/d@1.2.3.bare`,
    `file:///prebuilds/${host}/d.bare`
  ])
})

test('relative specifier, current directory', (t) => {
  function readPackage(url) {
    if (url.href === 'file:///a/b/package.json') {
      return {
        name: 'd'
      }
    }

    return null
  }

  const result = []

  for (const resolution of resolve(
    '.',
    new URL('file:///a/b/c'),
    { host, extensions: ['.bare'] },
    readPackage
  )) {
    result.push(resolution.href)
  }

  t.alike(result, [
    `file:///a/b/prebuilds/${host}/d.bare`,
    `file:///a/prebuilds/${host}/d.bare`,
    `file:///prebuilds/${host}/d.bare`
  ])
})

test('relative specifier, parent directory', (t) => {
  function readPackage(url) {
    if (url.href === 'file:///a/package.json') {
      return {
        name: 'd'
      }
    }

    return null
  }

  const result = []

  for (const resolution of resolve(
    '..',
    new URL('file:///a/b/c'),
    { host, extensions: ['.bare'] },
    readPackage
  )) {
    result.push(resolution.href)
  }

  t.alike(result, [
    `file:///a/prebuilds/${host}/d.bare`,
    `file:///prebuilds/${host}/d.bare`
  ])
})

test('relative specifier with scope and no version', (t) => {
  function readPackage(url) {
    if (url.href === 'file:///a/b/@d/e/package.json') {
      return {
        name: 'e'
      }
    }

    return null
  }

  const result = []

  for (const resolution of resolve(
    './@d/e',
    new URL('file:///a/b/c'),
    { host, extensions: ['.bare'] },
    readPackage
  )) {
    result.push(resolution.href)
  }

  t.alike(result, [
    `file:///a/b/@d/e/prebuilds/${host}/e.bare`,
    `file:///a/b/@d/prebuilds/${host}/e.bare`,
    `file:///a/b/prebuilds/${host}/e.bare`,
    `file:///a/prebuilds/${host}/e.bare`,
    `file:///prebuilds/${host}/e.bare`
  ])
})

test('absolute specifier, pkg.name', (t) => {
  function readPackage(url) {
    if (url.href === 'file:///d/package.json') {
      return {
        name: 'd'
      }
    }

    return null
  }

  const result = []

  for (const resolution of resolve(
    '/d',
    new URL('file:///a/b/c'),
    { host, extensions: ['.bare'] },
    readPackage
  )) {
    result.push(resolution.href)
  }

  t.alike(result, [
    `file:///d/prebuilds/${host}/d.bare`,
    `file:///prebuilds/${host}/d.bare`
  ])
})

test('absolute specifier, Windows path', (t) => {
  function readPackage(url) {
    if (url.href === 'file:///d/package.json') {
      return {
        name: 'd'
      }
    }

    return null
  }

  const result = []

  for (const resolution of resolve(
    '\\d',
    new URL('file:///a/b/c'),
    { host, extensions: ['.bare'] },
    readPackage
  )) {
    result.push(resolution.href)
  }

  t.alike(result, [
    `file:///d/prebuilds/${host}/d.bare`,
    `file:///prebuilds/${host}/d.bare`
  ])
})

test('absolute specifier, Windows path with drive letter', (t) => {
  function readPackage(url) {
    if (url.href === 'file:///c:/d/package.json') {
      return {
        name: 'd'
      }
    }

    return null
  }

  const result = []

  for (const resolution of resolve(
    'c:\\d',
    new URL('file:///a/b/c'),
    { host, extensions: ['.bare'] },
    readPackage
  )) {
    result.push(resolution.href)
  }

  t.alike(result, [
    `file:///c:/d/prebuilds/${host}/d.bare`,
    `file:///c:/prebuilds/${host}/d.bare`
  ])
})

test('builtin, relative specifier, pkg.name', (t) => {
  function readPackage(url) {
    if (url.href === 'file:///a/b/d/package.json') {
      return {
        name: 'e'
      }
    }

    return null
  }

  const result = []

  for (const resolution of resolve(
    './d',
    new URL('file:///a/b/c'),
    { builtins: ['e'] },
    readPackage
  )) {
    result.push(resolution.href)
  }

  t.alike(result, ['builtin:e'])
})

test('builtin, relative specifier, pkg.name + pkg.version', (t) => {
  function readPackage(url) {
    if (url.href === 'file:///a/b/d/package.json') {
      return {
        name: 'e',
        version: '1.2.3'
      }
    }

    return null
  }

  const result = []

  for (const resolution of resolve(
    './d',
    new URL('file:///a/b/c'),
    { builtins: ['e'] },
    readPackage
  )) {
    result.push(resolution.href)
  }

  t.alike(result, ['builtin:e@1.2.3'])
})

test('versioned builtin, relative specifier, pkg.name', (t) => {
  function readPackage(url) {
    if (url.href === 'file:///a/b/d/package.json') {
      return {
        name: 'e'
      }
    }

    return null
  }

  const result = []

  for (const resolution of resolve(
    './d',
    new URL('file:///a/b/c'),
    { builtins: ['e@1.2.3'] },
    readPackage
  )) {
    result.push(resolution.href)
  }

  t.alike(result, ['builtin:e@1.2.3'])
})

test('versioned builtin, relative specifier, pkg.name + pkg.version', (t) => {
  function readPackage(url) {
    if (url.href === 'file:///a/b/d/package.json') {
      return {
        name: 'e',
        version: '1.2.3'
      }
    }

    return null
  }

  const result = []

  for (const resolution of resolve(
    './d',
    new URL('file:///a/b/c'),
    { builtins: ['e@1.2.3'] },
    readPackage
  )) {
    result.push(resolution.href)
  }

  t.alike(result, ['builtin:e@1.2.3'])
})

test('versioned builtin, relative specifier, pkg.name + pkg.version, version mismatch', (t) => {
  function readPackage(url) {
    if (url.href === 'file:///a/b/d/package.json') {
      return {
        name: 'e',
        version: '1.2.3'
      }
    }

    return null
  }

  const result = []

  for (const resolution of resolve(
    './d',
    new URL('file:///a/b/c'),
    { builtins: ['e@1.2.4'] },
    readPackage
  )) {
    result.push(resolution.href)
  }

  t.alike(result, [])
})

test('builtin, bare specifier, pkg.name', (t) => {
  function readPackage(url) {
    if (url.href === 'file:///a/b/node_modules/d/package.json') {
      return {
        name: 'e'
      }
    }

    return null
  }

  const result = []

  for (const resolution of resolve(
    'd',
    new URL('file:///a/b/c'),
    { builtins: ['e'] },
    readPackage
  )) {
    result.push(resolution.href)
  }

  t.alike(result, ['builtin:e'])
})

test('builtin, bare specifier, pkg.name + pkg.version', (t) => {
  function readPackage(url) {
    if (url.href === 'file:///a/b/node_modules/d/package.json') {
      return {
        name: 'e',
        version: '1.2.3'
      }
    }

    return null
  }

  const result = []

  for (const resolution of resolve(
    'd',
    new URL('file:///a/b/c'),
    { builtins: ['e'] },
    readPackage
  )) {
    result.push(resolution.href)
  }

  t.alike(result, ['builtin:e@1.2.3'])
})

test('versioned builtin, bare specifier, pkg.name', (t) => {
  function readPackage(url) {
    if (url.href === 'file:///a/b/node_modules/d/package.json') {
      return {
        name: 'e'
      }
    }

    return null
  }

  const result = []

  for (const resolution of resolve(
    'd',
    new URL('file:///a/b/c'),
    { builtins: ['e@1.2.3'] },
    readPackage
  )) {
    result.push(resolution.href)
  }

  t.alike(result, ['builtin:e@1.2.3'])
})

test('versioned builtin, bare specifier, pkg.name + pkg.version', (t) => {
  function readPackage(url) {
    if (url.href === 'file:///a/b/node_modules/d/package.json') {
      return {
        name: 'e',
        version: '1.2.3'
      }
    }

    return null
  }

  const result = []

  for (const resolution of resolve(
    'd',
    new URL('file:///a/b/c'),
    { builtins: ['e@1.2.3'] },
    readPackage
  )) {
    result.push(resolution.href)
  }

  t.alike(result, ['builtin:e@1.2.3'])
})

test('versioned builtin, bare specifier, pkg.name + pkg.version, version mismatch', (t) => {
  function readPackage(url) {
    if (url.href === 'file:///a/b/node_modules/d/package.json') {
      return {
        name: 'e',
        version: '1.2.3'
      }
    }

    return null
  }

  const result = []

  for (const resolution of resolve(
    'd',
    new URL('file:///a/b/c'),
    { builtins: ['e@1.2.4'] },
    readPackage
  )) {
    result.push(resolution.href)
  }

  t.alike(result, [])
})

test('builtin, versioned bare specifier, pkg.name', (t) => {
  function readPackage(url) {
    if (url.href === 'file:///a/b/node_modules/d/package.json') {
      return {
        name: 'e'
      }
    }

    return null
  }

  const result = []

  for (const resolution of resolve(
    'd@1.2.3',
    new URL('file:///a/b/c'),
    { builtins: ['e'] },
    readPackage
  )) {
    result.push(resolution.href)
  }

  t.alike(result, ['builtin:e@1.2.3'])
})

test('builtin, versioned bare specifier, pkg.name + pkg.version', (t) => {
  function readPackage(url) {
    if (url.href === 'file:///a/b/node_modules/d/package.json') {
      return {
        name: 'e',
        version: '1.2.3'
      }
    }

    return null
  }

  const result = []

  for (const resolution of resolve(
    'd@1.2.3',
    new URL('file:///a/b/c'),
    { builtins: ['e'] },
    readPackage
  )) {
    result.push(resolution.href)
  }

  t.alike(result, ['builtin:e@1.2.3'])
})

test('builtin, versioned bare specifier, pkg.name + pkg.version, version mismatch', (t) => {
  function readPackage(url) {
    if (url.href === 'file:///a/b/node_modules/d/package.json') {
      return {
        name: 'e',
        version: '1.2.3'
      }
    }

    return null
  }

  const result = []

  for (const resolution of resolve(
    'd@1.2.4',
    new URL('file:///a/b/c'),
    { builtins: ['e'] },
    readPackage
  )) {
    result.push(resolution.href)
  }

  t.alike(result, [])
})

test('versioned builtin, versioned bare specifier, pkg.name', (t) => {
  function readPackage(url) {
    if (url.href === 'file:///a/b/node_modules/d/package.json') {
      return {
        name: 'e'
      }
    }

    return null
  }

  const result = []

  for (const resolution of resolve(
    'd@1.2.3',
    new URL('file:///a/b/c'),
    { builtins: ['e@1.2.3'] },
    readPackage
  )) {
    result.push(resolution.href)
  }

  t.alike(result, ['builtin:e@1.2.3'])
})

test('versioned builtin, versioned bare specifier, pkg.name + pkg.version', (t) => {
  function readPackage(url) {
    if (url.href === 'file:///a/b/node_modules/d/package.json') {
      return {
        name: 'e',
        version: '1.2.3'
      }
    }

    return null
  }

  const result = []

  for (const resolution of resolve(
    'd@1.2.3',
    new URL('file:///a/b/c'),
    { builtins: ['e@1.2.3'] },
    readPackage
  )) {
    result.push(resolution.href)
  }

  t.alike(result, ['builtin:e@1.2.3'])
})

test('versioned builtin, versioned bare specifier, pkg.name, version mismatch', (t) => {
  function readPackage(url) {
    if (url.href === 'file:///a/b/node_modules/d/package.json') {
      return {
        name: 'e'
      }
    }

    return null
  }

  const result = []

  for (const resolution of resolve(
    'd@1.2.4',
    new URL('file:///a/b/c'),
    { builtins: ['e@1.2.3'] },
    readPackage
  )) {
    result.push(resolution.href)
  }

  t.alike(result, [])
})

test('versioned builtin, versioned bare specifier, pkg.name + pkg.version, version mismatch', (t) => {
  function readPackage(url) {
    if (url.href === 'file:///a/b/node_modules/d/package.json') {
      return {
        name: 'e',
        version: '1.2.3'
      }
    }

    return null
  }

  const result = []

  for (const resolution of resolve(
    'd@1.2.4',
    new URL('file:///a/b/c'),
    { builtins: ['e@1.2.4'] },
    readPackage
  )) {
    result.push(resolution.href)
  }

  t.alike(result, [])
})

test('conditional builtin, bare specifier, pkg.name + pkg.version', (t) => {
  function readPackage(url) {
    if (url.href === 'file:///a/b/node_modules/d/package.json') {
      return {
        name: 'e',
        version: '1.2.3'
      }
    }

    return null
  }

  let result = []

  for (const resolution of resolve(
    'd',
    new URL('file:///a/b/c'),
    { builtins: [{ addon: 'e' }], conditions: ['addon'] },
    readPackage
  )) {
    result.push(resolution.href)
  }

  t.alike(result, ['builtin:e@1.2.3'])

  result = []

  for (const resolution of resolve(
    'd',
    new URL('file:///a/b/c'),
    { builtins: [{ addon: 'e' }] },
    readPackage
  )) {
    result.push(resolution.href)
  }

  t.alike(result, [])
})

test('self reference, pkg.name', (t) => {
  function readPackage(url) {
    if (url.href === 'file:///a/b/package.json') {
      return {
        name: 'e'
      }
    }

    return null
  }

  const result = []

  for (const resolution of resolve(
    'e',
    new URL('file:///a/b/c'),
    { host, extensions: ['.bare'] },
    readPackage
  )) {
    result.push(resolution.href)
  }

  t.alike(result, [
    'file:///a/b/prebuilds/host/e.bare',
    'file:///a/prebuilds/host/e.bare',
    'file:///prebuilds/host/e.bare'
  ])
})

test('self reference, pkg.name + pkg.version', (t) => {
  function readPackage(url) {
    if (url.href === 'file:///a/b/package.json') {
      return {
        name: 'e',
        version: '1.2.3'
      }
    }

    return null
  }

  const result = []

  for (const resolution of resolve(
    'e',
    new URL('file:///a/b/c'),
    { host, extensions: ['.bare'] },
    readPackage
  )) {
    result.push(resolution.href)
  }

  t.alike(result, [
    'file:///a/b/prebuilds/host/e@1.2.3.bare',
    'file:///a/b/prebuilds/host/e.bare',
    'file:///a/prebuilds/host/e@1.2.3.bare',
    'file:///a/prebuilds/host/e.bare',
    'file:///prebuilds/host/e@1.2.3.bare',
    'file:///prebuilds/host/e.bare'
  ])
})

test('resolutions map', (t) => {
  const resolutions = {
    'file:///a/b/c': {
      '.': {
        addon: './d.bare'
      }
    }
  }

  const result = []

  for (const resolution of resolve('.', new URL('file:///a/b/c'), {
    resolutions,
    conditions: ['addon']
  })) {
    result.push(resolution.href)
  }

  t.alike(result, ['file:///a/b/d.bare'])
})

test('linked module, darwin', (t) => {
  function readPackage(url) {
    if (url.href === 'file:///a/b/package.json') {
      return {
        name: 'e',
        version: '1.2.3'
      }
    }

    return null
  }

  const host = 'darwin-arm64'
  const result = []

  for (const resolution of resolve(
    'e',
    new URL('file:///a/b/c'),
    { host },
    readPackage
  )) {
    result.push(resolution.href)
  }

  t.alike(result, [
    'linked:e.1.2.3.framework/e.1.2.3',
    'linked:libe.1.2.3.dylib',
    'linked:e.framework/e',
    'linked:libe.dylib'
  ])
})

test('linked module, ios', (t) => {
  function readPackage(url) {
    if (url.href === 'file:///a/b/package.json') {
      return {
        name: 'e',
        version: '1.2.3'
      }
    }

    return null
  }

  const host = 'ios-arm64'
  const result = []

  for (const resolution of resolve(
    'e',
    new URL('file:///a/b/c'),
    { host },
    readPackage
  )) {
    result.push(resolution.href)
  }

  t.alike(result, ['linked:e.1.2.3.framework/e.1.2.3', 'linked:e.framework/e'])
})

test('linked module, linux', (t) => {
  function readPackage(url) {
    if (url.href === 'file:///a/b/package.json') {
      return {
        name: 'e',
        version: '1.2.3'
      }
    }

    return null
  }

  const host = 'linux-arm64'
  const result = []

  for (const resolution of resolve(
    'e',
    new URL('file:///a/b/c'),
    { host },
    readPackage
  )) {
    result.push(resolution.href)
  }

  t.alike(result, ['linked:libe.1.2.3.so', 'linked:libe.so'])
})

test('linked module, android', (t) => {
  function readPackage(url) {
    if (url.href === 'file:///a/b/package.json') {
      return {
        name: 'e',
        version: '1.2.3'
      }
    }

    return null
  }

  const host = 'android-arm64'
  const result = []

  for (const resolution of resolve(
    'e',
    new URL('file:///a/b/c'),
    { host },
    readPackage
  )) {
    result.push(resolution.href)
  }

  t.alike(result, ['linked:libe.1.2.3.so', 'linked:libe.so'])
})

test('linked module, win32', (t) => {
  function readPackage(url) {
    if (url.href === 'file:///a/b/package.json') {
      return {
        name: 'e',
        version: '1.2.3'
      }
    }

    return null
  }

  const host = 'win32-arm64'
  const result = []

  for (const resolution of resolve(
    'e',
    new URL('file:///a/b/c'),
    { host },
    readPackage
  )) {
    result.push(resolution.href)
  }

  t.alike(result, ['linked:e-1.2.3.dll', 'linked:e.dll'])
})

test('multiple hosts, bare specifier', (t) => {
  function readPackage(url) {
    if (url.href === 'file:///a/b/node_modules/d/package.json') {
      return {
        name: 'd'
      }
    }

    return null
  }

  const matched = []
  const result = []

  for (const resolution of resolve(
    'd',
    new URL('file:///a/b/c'),
    {
      hosts: ['host-foo', 'host-bar'],
      extensions: ['.bare'],
      matchedConditions: matched
    },
    readPackage
  )) {
    result.push([resolution.href, [...matched]])
  }

  t.alike(result, [
    [`file:///a/b/node_modules/d/prebuilds/host-foo/d.bare`, ['host', 'foo']],
    [`file:///a/b/node_modules/d/prebuilds/host-bar/d.bare`, ['host', 'bar']],
    [`file:///a/b/node_modules/prebuilds/host-foo/d.bare`, ['host', 'foo']],
    [`file:///a/b/node_modules/prebuilds/host-bar/d.bare`, ['host', 'bar']],
    [`file:///a/b/prebuilds/host-foo/d.bare`, ['host', 'foo']],
    [`file:///a/b/prebuilds/host-bar/d.bare`, ['host', 'bar']],
    [`file:///a/prebuilds/host-foo/d.bare`, ['host', 'foo']],
    [`file:///a/prebuilds/host-bar/d.bare`, ['host', 'bar']],
    [`file:///prebuilds/host-foo/d.bare`, ['host', 'foo']],
    [`file:///prebuilds/host-bar/d.bare`, ['host', 'bar']]
  ])
})

test('multiple hosts, linked module', (t) => {
  function readPackage(url) {
    if (url.href === 'file:///a/b/package.json') {
      return {
        name: 'e',
        version: '1.2.3'
      }
    }

    return null
  }

  const matched = []
  const result = []

  for (const resolution of resolve(
    'e',
    new URL('file:///a/b/c'),
    {
      hosts: ['darwin-x64', 'linux-arm64'],
      matchedConditions: matched
    },
    readPackage
  )) {
    result.push([resolution.href, [...matched]])
  }

  t.alike(result, [
    ['linked:e.1.2.3.framework/e.1.2.3', ['darwin']],
    ['linked:libe.1.2.3.dylib', ['darwin']],
    ['linked:e.framework/e', ['darwin']],
    ['linked:libe.dylib', ['darwin']],
    ['linked:libe.1.2.3.so', ['linux']],
    ['linked:libe.so', ['linux']]
  ])
})

test('prebuilds scope lookup with resolutions map', (t) => {
  const resolutions = {
    'file:///a/b/': {
      '#prebuilds': 'file:///a/prebuilds/'
    }
  }

  const result = []

  for (const scope of resolve.lookupPrebuildsScope(new URL('file:///a/b/'), {
    resolutions
  })) {
    result.push(scope.href)
  }

  t.alike(result, ['file:///a/prebuilds/'])
})

test('prebuilds scope lookup with root file: URL', (t) => {
  const result = []

  for (const scope of resolve.lookupPrebuildsScope(new URL('file:///'))) {
    result.push(scope.href)
  }

  t.alike(result, ['file:///prebuilds/'])
})

test('prebuilds scope lookup with root non-file: URL', (t) => {
  const result = []

  for (const scope of resolve.lookupPrebuildsScope(new URL('drive:///'))) {
    result.push(scope.href)
  }

  t.alike(result, ['drive:///prebuilds/'])
})
