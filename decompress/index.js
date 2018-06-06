/**
 * @file decompress
 * @author Cuttle Cong
 * @date 2018/6/2
 * @description
 */
const _decompress = require('decompress')
const decompressTar = require('decompress-tar')
const decompressTarbz2 = require('decompress-tarbz2')
const decompressTargz = require('decompress-targz')
const unzip = require('./unzip')
const nps = require('path')

function decompress(src, dest) {
  return _decompress(src, dest, {
    plugins: [decompressTar(), decompressTarbz2(), decompressTargz(), unzip()]
  })
}
module.exports = decompress
