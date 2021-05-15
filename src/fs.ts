/// <reference path="./fs.d.ts" />

import isBrowser from 'is-browser'
import { fs as memfs } from 'memfs'
import pathBrowserify from 'path.js'

// This needs to run in the browser and node, so this is the way we are dealing with fs
export const fs = isBrowser ? memfs : require('fs')
export const path = isBrowser ? pathBrowserify : require('path')
