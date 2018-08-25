# express-restful-fileman

[![build status](https://img.shields.io/travis/imcuttle/express-restful-fileman/master.svg?style=flat-square)](https://travis-ci.org/imcuttle/express-restful-fileman)
[![Test coverage](https://img.shields.io/codecov/c/github/imcuttle/express-restful-fileman.svg?style=flat-square)](https://codecov.io/github/imcuttle/express-restful-fileman?branch=master)
[![NPM version](https://img.shields.io/npm/v/express-restful-fileman.svg?style=flat-square)](https://www.npmjs.com/package/express-restful-fileman)
[![NPM Downloads](https://img.shields.io/npm/dm/express-restful-fileman.svg?style=flat-square&maxAge=43200)](https://www.npmjs.com/package/express-restful-fileman)

A restful express router for manage(upload multi-files and remove files) file on web.

## Usage

    npm install express-restful-fileman --save

```javascript
const fileman = require('express-restful-fileman')
const app = require('express')()

app.use('/fileman', fileman(__dirname, { token: 'fake_token' }))
```

## Options

### `fileman(dirpath: string, { token?: string, enableDelete?: boolean, browserViewRoute?: string, browserViewOptions?: object })`

- `dirpath` (required): The file man's work directory.
- `token` (optional): Check request's **authorization header** when token is be setting. (default: null)
- `enableDelete` (optional): Whether enable the delete's API. (default: false)
- `browserViewRoute` (optional): The browserView route. (see [BrowserView Middleware](#browserview-middleware-v3))
- `browserViewOptions` (optional): The browserView Middleware Options. (see [BrowserView Middleware](#browserview-middleware-v3))

## Web API

### Method: `POST`

Add the files which is belongs path using `multipart/form-data`.

- Disable decompress (by default)  
  The request path means path of directory, and each file's filename means relative path.

  ```javascript
  request
    .post('/fileman/dir/path')
    .attach('0', makeFixture('img.png'))
    .attach('1', makeFixture('img.png'), { filepath: 'asasd/sds.png' })
    .expect(200)
    .end((err, res) => {
      expect(res.body).toEqual({
        code: 200,
        data: ['/dir/path/img.png', '/dir/path/asasd/sds.png']
      })

      expect(isFile('dir/path/img.png')).toBeTruthy()
      expect(isFile('dir/path/asasd/sds.png')).toBeTruthy()
      done()
    })
  ```

  Set path to be `dir/?force=true` to guarantee overwriting old file.

* Enable decompress (by append querystring `?decompress=true`)  
  The request path means path of directory too.

  ```javascript
  request
    .post('/fileman/zip?decompress=true&force=true')
    .set('authorization', 'fake_token')
    .attach('1', makeFixture('a.zip'))
    .end((err, res) => {
      expect(res.body).toEqual({
        code: 200,
        data: ['...paths']
      })

      expect(isFile('zip/你好.js')).toBeTruthy()
      expect(isFile('zip/filemanRouter.js')).toBeTruthy()
      expect(isFile('zip/FileMan.js')).toBeTruthy()
      done()
    })
  ```

### Method: `DELETE`

Remove the files which is belongs path.

eg. `/dir/abc` can clear the `dirpath/dir/abc`.

## BrowserView Middleware (>=v3)

**The Browser Upload UI.**

![](https://i.loli.net/2018/08/25/5b80ea988f18e.png)

### Usage

#### Mix in `restful-fileman`

```javascript
const fileman = require('express-restful-fileman')
const express = require('express')
const { join } = require('path')

const app = express()
app.use(
  '/fileman',
  fileman(join(__dirname, 'www'), {
    browserViewRoute: '', // `null` means disable ui feature.
    browserViewOptions: {
      /* options */
    }
  })
)
// GET: `/fileman` would servers browser UI.
```

#### Standalone

```javascript
const browserView = require('express-restful-fileman/browser-view')
const express = require('express')

const app = express()
app.use(
  '/ui',
  browserView({
    // options
  })
)
```

### Options

- `serverUrl`: The fileman's server url, eg. `http://example.com/fileman`. (default: `location.origin + location.pathname`)
- `serverUrlVisible`: Whether the serverUrl input ui control is visible. (default: `false`)
- `token`: Fileman server's token. (default: `null`)
- `namespace`: The relative path you want to upload, eg. `root/abc`. (default: `''`)
- `force`: see [Web API](#web-api) (default: `false`)
- `decompress`: see [Web API](#web-api) (default: `true`)
