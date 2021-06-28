import { readFileSync } from 'fs'
import { expect, Test, TestSuite } from 'testyts/build/testyCore'
import { JSLoader, CSSLoader, HTMLLoader } from '.'

@TestSuite('CSSLoader')
export class CSSLoaderTest {
  @Test('Web Destructure')
  webDestructure() {
    const c = new CSSLoader()
    expect.toThrowAsync(() => c.webDestructureImport('', '', [], false))
  }

  @Test('Web content')
  async webContent() {
    const c = new CSSLoader()
    expect.toBeEqual(
      await c.webContentImport(
        "This param shouldn't matter",
        'thisisaurl',
        false
      ),
      '<link rel="stylesheet" href="thisisaurl">'
    )
  }

  @Test('Local Destructure')
  localDestructure() {
    const c = new CSSLoader()
    expect.toThrowAsync(() => c.localDestructureImport('', '', [], false))
  }

  @Test('Inline local dev')
  async inlineLocalDev() {
    const c = new CSSLoader()
    expect.toBeEqual(
      await c.localContentImport(
        '.probablyCss { display:none; }',
        'no',
        false,
        false,
        '',
        ''
      ),
      '<style>.probablyCss { display:none; }</style>'
    )
  }

  @Test('Inline local production')
  async inlineLocalProd() {
    const c = new CSSLoader()
    expect.toBeEqual(
      await c.localContentImport(
        '.probablyCss { display:none; }',
        'no',
        true,
        false,
        '',
        ''
      ),
      '<style>.probablyCss{display:none}</style>'
    )
  }

  @Test('Linked local dev')
  async linkedLocalDev() {
    const c = new CSSLoader()
    expect.toBeEqual(
      await c.localContentImport(
        '.probablyCss { display:none; }',
        'no',
        false,
        true,
        '/tmp/',
        '/'
      ),
      '<link rel="stylesheet" type="text/css" rel="/css/0.css">'
    )

    expect.toBeEqual(
      readFileSync('/tmp/css/0.css').toString(),
      '.probablyCss { display:none; }'
    )

    expect.toBeEqual(
      await c.localContentImport(
        '.probablyCss { display:none; }',
        'no',
        false,
        true,
        '/tmp/',
        '/'
      ),
      '<link rel="stylesheet" type="text/css" rel="/css/0.css">'
    )
  }
}

@TestSuite('JSLoader')
export class JSLoaderTest {
  @Test('Web Destructure')
  webDestructure() {
    const c = new JSLoader()
    expect.toThrowAsync(() => c.webDestructureImport('', '', [], false))
  }

  @Test('Web content')
  async webContent() {
    const c = new JSLoader()
    expect.toBeEqual(
      await c.webContentImport(
        "This param shouldn't matter",
        'thisisaurl',
        false
      ),
      '<script src="thisisaurl"></script>'
    )
  }

  @Test('Local Destructure')
  localDestructure() {
    const c = new JSLoader()
    expect.toThrowAsync(() => c.localDestructureImport('', '', [], false))
  }

  @Test('Local Content')
  async localContent() {
    const c = new JSLoader()
    expect.toBeEqual(
      await c.localContentImport(
        'console.log("js")',
        'no',
        false,
        false,
        '',
        ''
      ),
      '<script>console.log("js")</script>'
    )
  }
}

@TestSuite('HTMLLoader')
export class HTMLLoaderTest {
  @Test('Web Destructure')
  webDestructure() {
    const c = new HTMLLoader()
    expect.toThrowAsync(() => c.webDestructureImport('', '', [], false))
  }

  @Test('Web content')
  async webContent() {
    const c = new HTMLLoader()
    expect.toThrowAsync(() =>
      c.webContentImport("This param shouldn't matter", 'thisisaurl', false)
    )
  }

  @Test('Local Destructure')
  localDestructure() {
    const c = new HTMLLoader()
    expect.toThrowAsync(() => c.localDestructureImport('', '', [], false))
  }

  @Test('Local Content')
  async localContent() {
    const c = new HTMLLoader()
    expect.toBeEqual(
      await c.localContentImport('probablyHTML', 'no', false),
      'probablyHTML'
    )
  }
}
