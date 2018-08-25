/**
 * @file index
 * @author Cuttle Cong
 * @date 2018/8/24
 * @description
 */
// const template = require('lodash.template')
const { readFileSync } = require('fs')
const { join } = require('path')
const express = require('express')

const indexHTML = readFileSync(join(__dirname, 'dist/index.html')).toString()

function browserView(options = {}) {
  const router = new express.Router()

  function handleBrowserView(req, res, next) {
    const parsedHtml = indexHTML.replace(/{{(.+?)}}/g, (_, name) => {
      if (name === 'INITIAL__STATE') {
        return JSON.stringify(options)
      }
      return _
    })

    res.type('html')
    res.send(parsedHtml)
  }
  router.get('/', handleBrowserView)
  router.get('/index.html', handleBrowserView)

  router.use('/', express.static(join(__dirname, 'dist')))

  return router
}

module.exports = browserView
