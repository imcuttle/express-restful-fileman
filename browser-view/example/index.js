/**
 * @file index
 * @author Cuttle Cong
 * @date 2018/8/24
 * @description
 */
const express = require('express')
const { join } = require('path')
const cors = require('cors')
const fileman = require('../../')
const browser = require('../')

const app = express()

app.use(cors()).use(
  '/fileman',
  fileman(join(__dirname, '../www'), {
    token: 'test_tokenlll',
    browserViewRoute: '',
    browserViewOptions: {
      serverUrlVisible: true,
      serverUrl: 'https://a.io'
    }
  })
)
// .use('/bv', browser())

app.listen(8899, () => {
  console.log('Server run on port: %d', 8899)
})
