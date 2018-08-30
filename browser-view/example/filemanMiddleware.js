/**
 * @file filemanMiddleware
 * @author Cuttle Cong
 * @date 2018/8/30
 * @description
 */
const fileman = require('../../')
const { join } = require('path')

module.exports = fileman(join(__dirname, '../www'), {
  token: 'test_tokenlll',
  browserViewRoute: '',
  browserViewOptions: {
    serverUrlVisible: false
  }
})
