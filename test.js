const test = require('brittle')
const resolve = require('.')

const host = 'host'

test('relative specifier, pkg.name', (t) => {
  function readPackage (url) {
    if (url.href === 'file:///a/b/d/package.json') {
      return {
        name: 'd'
      }
    }

    return null
  }

  const result = []

  for (const resolution of resolve('./d', new URL('file:///a/b/c'), { host, extensions: ['.bare'] }, readPackage)) {
    result.push(resolution.href)
  }

  t.alike(result, [
    `file:///a/b/d/prebuilds/${host}/d.bare`
  ])
})

test('relative specifier, pkg.name + pkg.version', (t) => {
  function readPackage (url) {
    if (url.href === 'file:///a/b/d/package.json') {
      return {
        name: 'd',
        version: '1.2.3'
      }
    }

    return null
  }

  const result = []

  for (const resolution of resolve('./d', new URL('file:///a/b/c'), { host, extensions: ['.bare'] }, readPackage)) {
    result.push(resolution.href)
  }

  t.alike(result, [
    `file:///a/b/d/prebuilds/${host}/d.bare`,
    `file:///a/b/d/prebuilds/${host}/d@1.2.3.bare`
  ])
})

test('relative specifier, current directory', (t) => {
  function readPackage (url) {
    if (url.href === 'file:///a/b/package.json') {
      return {
        name: 'd'
      }
    }

    return null
  }

  const result = []

  for (const resolution of resolve('.', new URL('file:///a/b/c'), { host, extensions: ['.bare'] }, readPackage)) {
    result.push(resolution.href)
  }

  t.alike(result, [
    `file:///a/b/prebuilds/${host}/d.bare`
  ])
})

test('relative specifier, parent directory', (t) => {
  function readPackage (url) {
    if (url.href === 'file:///a/package.json') {
      return {
        name: 'd'
      }
    }

    return null
  }

  const result = []

  for (const resolution of resolve('..', new URL('file:///a/b/c'), { host, extensions: ['.bare'] }, readPackage)) {
    result.push(resolution.href)
  }

  t.alike(result, [
    `file:///a/prebuilds/${host}/d.bare`
  ])
})

test('absolute specifier, pkg.name', (t) => {
  function readPackage (url) {
    if (url.href === 'file:///d/package.json') {
      return {
        name: 'd'
      }
    }

    return null
  }

  const result = []

  for (const resolution of resolve('/d', new URL('file:///a/b/c'), { host, extensions: ['.bare'] }, readPackage)) {
    result.push(resolution.href)
  }

  t.alike(result, [
    `file:///d/prebuilds/${host}/d.bare`
  ])
})

test('absolute specifier, Windows path', (t) => {
  function readPackage (url) {
    if (url.href === 'file:///d/package.json') {
      return {
        name: 'd'
      }
    }

    return null
  }

  const result = []

  for (const resolution of resolve('\\d', new URL('file:///a/b/c'), { host, extensions: ['.bare'] }, readPackage)) {
    result.push(resolution.href)
  }

  t.alike(result, [
    `file:///d/prebuilds/${host}/d.bare`
  ])
})

test('absolute specifier, Windows path with drive letter', (t) => {
  function readPackage (url) {
    if (url.href === 'file:///c:/d/package.json') {
      return {
        name: 'd'
      }
    }

    return null
  }

  const result = []

  for (const resolution of resolve('c:\\d', new URL('file:///a/b/c'), { host, extensions: ['.bare'] }, readPackage)) {
    result.push(resolution.href)
  }

  t.alike(result, [
    `file:///c:/d/prebuilds/${host}/d.bare`
  ])
})

test('builtin', (t) => {
  function readPackage (url) {
    if (url.href === 'file:///a/b/d/package.json') {
      return {
        name: 'e'
      }
    }

    return null
  }

  const result = []

  for (const resolution of resolve('d', new URL('file:///a/b/c'), { host, extensions: ['.bare'], builtins: ['e'] }, readPackage)) {
    result.push(resolution.href)
  }

  t.alike(result, ['builtin:e'])
})

test('prebuilds option', (t) => {
  function readPackage (url) {
    if (url.href === 'file:///a/b/d/package.json') {
      return {
        name: 'e'
      }
    }

    return null
  }

  const prebuilds = new URL(`file:///f/prebuilds/${host}/`)

  const result = []

  for (const resolution of resolve('./d', new URL('file:///a/b/c'), { prebuilds, extensions: ['.bare'] }, readPackage)) {
    result.push(resolution.href)
  }

  t.alike(result, ['file:///f/prebuilds/host/e.bare'])
})

test('prebuilds + name option', (t) => {
  const prebuilds = new URL(`file:///f/prebuilds/${host}/`)

  const result = []

  for (const resolution of resolve('./d', new URL('file:///a/b/c'), { prebuilds, name: 'e', extensions: ['.bare'] })) {
    result.push(resolution.href)
  }

  t.alike(result, ['file:///f/prebuilds/host/e.bare'])
})

test('prebuilds + name + version option', (t) => {
  const prebuilds = new URL(`file:///f/prebuilds/${host}/`)

  const result = []

  for (const resolution of resolve('./d', new URL('file:///a/b/c'), { prebuilds, name: 'e', version: '1.2.3', extensions: ['.bare'] })) {
    result.push(resolution.href)
  }

  t.alike(result, [
    'file:///f/prebuilds/host/e.bare',
    'file:///f/prebuilds/host/e@1.2.3.bare'
  ])
})
