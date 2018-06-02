/**
 * @file Fileman
 * @author Cuttle Cong
 * @date 2018/6/2
 * @description
 */
const fs = require('fs')
const nps = require('path')
const pify = require('pify')
const assert = require('assert')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const decompress = require('./decompress')

class FileMan {
  constructor(root) {
    root = nps.resolve(root)
    assert(
      fs.existsSync(root) && fs.statSync(root).isDirectory(),
      'root should be an directory.'
    )

    this.root = root
  }

  _p(p) {
    return nps.join(this.root, p)
  }

  mkdirp(path, opts) {
    return pify(mkdirp)(this._p(path), opts)
  }

  touch(path, data, options = {}) {
    return this.mkdirp(nps.dirname(path)).then(() => {
      if (!options.force && this.exists(path)) {
        throw new Error(
          'Touch file: ' +
            path +
            ' failed, because the file has already existed, please set `force` to overwrite it.'
        )
      }
      return pify(fs.writeFile)(this._p(path), data, options)
    })
  }

  exists(path) {
    return fs.existsSync(this._p(path))
  }

  decompress(input, dest, options = {}) {
    if (!options.force && this.exists(dest)) {
      return Promise.reject(
        new Error(
          'Decompress failed, because the destination "' +
            dest +
            '" has already existed, please set `force` to overwrite it.'
        )
      )
    }

    return decompress(input, this._p(dest))
  }

  rm(path, options = {}) {
    return pify(rimraf)(this._p(path), options)
  }
}

module.exports = FileMan
