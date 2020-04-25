/**
 * @file index
 * @author imcuttle
 * @date 2018/4/4
 * @description
 */

const FileMan = require('./FileMan')
const { Router } = require('express')
const nps = require('path')
const upload = require('express-fileupload')

const browserView = require('./browser-view')

function assertPath(path) {
  if (/(^\.\.\/)|(\/\.\.\/)/.test(path)) {
    throw new Error(`Fileman forbids path ("${path}") is forward.`)
  }
}

function defaultFail(res, error) {
  let message = error
  if (error instanceof Error) {
    message =
      process.env.NODE_ENV !== 'production' ? error.stack : error.message
  }

  res.status(502).json({ code: 502, message })
}

function defaultPass(res, data = 'ok') {
  res.status(200).json({ code: 200, data })
}

function restfulFileManRouter(
  root,
  { token, enableDelete, browserViewRoute, browserViewOptions, fail = defaultFail, pass = defaultPass, generateFilename = ({name, md5}) => name || md5 }
) {
  let fm = new FileMan(root)



  const auth = function(req, res, next) {
    if (!token || req.headers['authorization'] === token) {
      next()
    } else {
      fail(res, 'auth-failed')
    }
  }

  function wrap(func) {
    return function(req, res, next) {
      try {
        return func(req, res, next)
      } catch (err) {
        console.error(err)
        fail(res, err)
      }
    }
  }

  let r = new Router().post(
    '**',
    auth,
    upload({ preservePath: true }),
    wrap(function(req, res) {
      let { decompress, force } = req.query
      let isDecompress = decompress === 'true'
      force = force === 'true'
      let path = req.params[0]
      assertPath(path)

      let paths = []
      const ps = []
      for (let key in req.files) {
        const files = Array.isArray(req.files[key])
          ? req.files[key]
          : [req.files[key]]
        files.forEach(({ name, md5, data, ...rest }) => {
          name = generateFilename({name, md5, data, ...rest})
          assertPath(name)
          let filepath = path
          if (!isDecompress) {
            filepath = nps.join(path, name)
            ps.push(fm.touch(filepath, data, { force }))

            paths.push(filepath)
          } else {
            ps.push(
              fm
                .decompress(data, filepath, { force })
                .then(
                  ipaths =>
                    (paths = paths.concat(
                      ipaths.map(p => nps.join(filepath, p))
                    ))
                )
            )
          }
        })
      }

      Promise.all(ps)
        .then(() => {
          if (paths && paths.length) {
            pass(res, paths)
          } else {
            fail(res, "Don't find files could be uploaded.")
          }
        })
        .catch(err => {
          console.error(err)
          fail(res, err)
        })
    })
  )

  if (enableDelete) {
    r.delete(
      '**',
      auth,
      wrap(function(req, res) {
        let path = req.params[0]
        assertPath(path)

        return fm
          .rm(path)
          .then(() => pass(res, path))
          .catch(err => {
            console.error(err)
            const msg = err

            fail(res, err)
          })
      })
    )
  }

  if (typeof browserViewRoute === 'string') {
    r.use(
      browserViewRoute,
      wrap(browserView(Object.assign({ token }, browserViewOptions)))
    )
  }

  return r
}

module.exports = restfulFileManRouter
