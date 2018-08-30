/**
 * @file index
 * @author Cuttle Cong
 * @date 2018/8/24
 * @description
 */
const express = require('express')
const { join } = require('path')
const cors = require('cors')
const browser = require('../')
const filemanMiddleware = require('./filemanMiddleware')

const app = express()

app.use(cors()).use('/fileman', filemanMiddleware)
// .use('/bv', browser())

app.listen(8899, () => {
  console.log('Server run on port: %d', 8899)
})
