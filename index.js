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

function restfulFileManRouter(root, token) {
  let fm = new FileMan(root)

  function fail(res, message) {
    res.status(502).json({ code: 502, message })
  }

  function pass(res, data = 'ok') {
    res.status(200).json({ code: 200, data })
  }

  return new Router()
    .use(function(req, res, next) {
      if (!token || req.headers['authorization'] === token) {
        next()
      } else {
        fail(res, 'auth-failed')
      }
    })
    .post('**', upload({ preservePath: true }), function(req, res) {
      let { decompress, force } = req.query
      let isDecompress = decompress === 'true'
      force = force === 'true'

      let path = req.params[0]
      const ps = []
      for (let key in req.files) {
        let { name, data } = req.files[key]

        if (!isDecompress) {
          ps.push(fm.touch(nps.join(path, name), data, { force }))
        } else {
          ps.push(fm.decompress(data, path, { force }))
        }
      }

      Promise.all(ps)
        .then(() => {
          pass(res)
        })
        .catch(err => {
          console.error(err)
          fail(res, String(err))
        })
    })
    .delete('**', function(req, res) {
      let path = req.params[0]
      return fm
        .rm(path)
        .then(() => pass(res))
        .catch(err => {
          console.error(err)
          fail(res, String(err))
        })
    })
}

module.exports = restfulFileManRouter
