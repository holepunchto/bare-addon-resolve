import URL from 'bare-url'
import { constants, type ResolveOptions } from 'bare-module-resolve'

type JSON = string | number | boolean | JSON[] | { [key: string]: JSON }

interface AddonResolveOptions extends ResolveOptions {
  host?: string
  hosts?: string[]
  linked?: boolean
  linkedProtocol?: string
}

declare function resolve(
  specifier: string,
  parentURL: URL,
  readPackage?: (url: URL) => JSON | null
): Iterable<URL>

declare function resolve(
  specifier: string,
  parentURL: URL,
  readPackage: (url: URL) => Promise<JSON | null>
): AsyncIterable<URL>

declare function resolve(
  specifier: string,
  parentURL: URL,
  opts: AddonResolveOptions,
  readPackage?: (url: URL) => JSON | null
): Iterable<URL>

declare function resolve(
  specifier: string,
  parentURL: URL,
  opts: AddonResolveOptions,
  readPackage: (url: URL) => Promise<JSON | null>
): AsyncIterable<URL>

declare namespace resolve {
  export { type AddonResolveOptions }

  export { constants }

  export type AddonResolver = Generator<
    | { resolution: URL; package: undefined }
    | { package: URL; resolution: undefined },
    number,
    void | boolean | JSON | null
  >

  export function addon(
    specifier: string,
    parentURL: URL,
    opts?: AddonResolveOptions
  ): AddonResolver

  export function url(
    specifier: string,
    parentURL: URL,
    opts?: AddonResolveOptions
  ): AddonResolver

  export function package(
    packageSpecifier: string,
    packageVersion: string,
    parentURL: URL,
    opts?: AddonResolveOptions
  ): AddonResolver

  export function packageSelf(
    packageName: string,
    packageSubpath: string,
    packageVersion: string,
    parentURL: URL,
    opts?: AddonResolveOptions
  ): AddonResolver

  export function file(
    filename: string,
    parentURL: URL,
    opts?: AddonResolveOptions
  ): AddonResolver

  export function directory(
    dirname: string,
    version: string,
    parentURL: URL,
    opts?: ResolveOptions
  ): AddonResolver

  export function linked(
    name: string,
    version?: string,
    opts?: AddonResolveOptions
  ): AddonResolver
}

export = resolve
