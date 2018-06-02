/**
 * @file helper
 * @author Cuttle Cong
 * @date 2018/6/2
 * @description
 */
const nps = require('path')

exports.makeFixture = function() {
  return nps.join.apply(
    null,
    [__dirname, 'fixture'].concat(Array.prototype.slice.call(arguments))
  )
}
