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

function assertPath(path) {
  if (/(^\.\.\/)|(\/\.\.\/)/.test(path)) {
    throw new Error(`Fileman forbids path ("${path}") is forward.`)
  }
}

function restfulFileManRouter(root, { token, enableDelete }) {
  let fm = new FileMan(root)

  function fail(res, message) {
    res.status(502).json({ code: 502, message })
  }

  function pass(res, data = 'ok') {
    res.status(200).json({ code: 200, data })
  }

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
        fail(res, String(err))
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
        let { name, data } = req.files[key]
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
      }

      Promise.all(ps)
        .then(() => {
          pass(res, paths)
        })
        .catch(err => {
          console.error(err)
          fail(res, String(err))
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
            fail(res, String(err))
          })
      })
    )
  }

  return r
}

module.exports = restfulFileManRouter
