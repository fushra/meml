<div align="center">

# MEML

Write simpler code to target the web

[![forthebadge](https://forthebadge.com/images/badges/built-by-developers.svg)](https://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/made-with-typescript.svg)](https://forthebadge.com)

[![Codecov](https://img.shields.io/codecov/c/github/fushra/meml?style=for-the-badge)](https://app.codecov.io/gh/fushra/meml/)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/fushra/meml/CodeCov?label=Tests&style=for-the-badge)](https://github.com/fushra/meml/actions/workflows/tests.yml)
[![Discord](https://img.shields.io/discord/841238828042944562?style=for-the-badge)](https://discord.gg/UPQW9juP5Z)

</div>

## What is it?

MEML is a simple programing language with the intent of making static webpages easier to write. The following two design principles guide language design:

1. **Conciseness:** HTML is far to verbose, leading to a lot of extra characters with limited purpose.
2. **Reusability:** The main feature of react used in static sites is components, to reduce code duplication. MEML attempts to provide a similar component (although static) system

This leads to a language that looks something like this:

```meml
(head
    (title "Hello World")
)
(body
    (h1 "Hello World")
)
```

Which translates to

```html
<!DOCTYPE html>
<html>
    <head>
        <title>Hello World</title>
    <head>
    <body>
        <h1>Hello World</h1>
    </body>
</html>
```

Components can be used for shared code, for example `nav.meml`:

```meml
(component Nav ()
    (nav
        (div "Page 1")
        (div "Page 2")
        (div "Page 3")
    )
)

(export (Nav))
```

`index.meml`

```meml
(import (Nav) from './nav.meml')

(head
    (title "Hello World")
)
(body
    (Nav)
    (h1 "Hello World")
)
```

## Installation and usage

**Recommendation:** Using `memlc` gets clunky with larger projects, try using [mld](https://github.com/fushra/mld) instead.

Before you install, make sure you have both `node` and `npm` on your computer. Create a folder that you want your MEML project to be in and run `npm init` to set it up.

Then install the development version of MEML by running:

```sh
npm install meml
```

> On MacOS and Linux, you may need to run `sudo npm install meml`

You can then run it with

```sh
npx memlc --file [fileName]
```

## Source and out directories

There are very few cases where you want the output of memlc to be dumped in the same folder as your source files. To handle this, memlc offers both `--src` and `--out` flags. When you set both of these flags, `--file` will now be relative to `--src` and the outputs will be dumped in `--out`. For example:

```sh
npx memlc --file ./src/index.meml # Will output in ./src/index.html
# Becomes
npx memlc --src ./src/ --file index.meml --out ./public/ # Will output in ./public/index.html
```

## Boring legal stuff

MemlC Copyright (C) 2021 Fushra & Fivnex

This program comes with ABSOLUTELY NO WARRANTY. This is free software, and you are welcome to redistribute it under certain conditions. For more information see the [license](./LIVENSE) file.
