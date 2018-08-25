/**
 * @file filemanRouter
 * @author imcuttle
 * @date 2018/4/4
 */
const nps = require('path')
const express = require('express')
const fs = require('fs')
const mkdirp = require('mkdirp')
const request = require('supertest')

const filemanRouter = require('../index')
const { makeFixture } = require('./helper')
const rimraf = require('rimraf')

describe('filemanRouter', function() {
  const app = express()
  function isFile(path) {
    path = makeFixture('filemanRouter', path)
    return fs.existsSync(path) && fs.statSync(path).isFile()
  }

  mkdirp.sync(makeFixture('filemanRouter'))
  app.use('/token', filemanRouter(makeFixture('filemanRouter'), { token: 'fake_token', enableDelete: true }))
  app.use(filemanRouter(makeFixture('filemanRouter'), { enableDelete: true }))

  beforeEach(function() {
    mkdirp.sync(makeFixture('filemanRouter'))
  })
  afterEach(function() {
    rimraf.sync(makeFixture('filemanRouter'))
  })

  it('should upload file', function(done) {
    request(app)
      .post('/asd/ww')
      .attach('0', makeFixture('img.png'))
      .attach('1', makeFixture('img.png'), { filepath: 'asasd/sds.png' })
      .expect(200)
      .end((err, res) => {
        expect(res.body).toEqual({
          code: 200,
          data: ['/asd/ww/img.png', '/asd/ww/asasd/sds.png']
        })

        expect(isFile('asd/ww/img.png')).toBeTruthy()
        expect(isFile('asd/ww/asasd/sds.png')).toBeTruthy()
        done()
      })
  })

  it('should upload file in root', function(done) {
    request(app)
      .post('/')
      .attach('0', makeFixture('img.png'))
      .attach('1', makeFixture('img.png'), { filepath: '/awd/asasd/sds.png' })
      .expect(200)
      .end((err, res) => {
        expect(res.body).toEqual({
          code: 200,
          data: ['/img.png', '/awd/asasd/sds.png']
        })

        expect(isFile('img.png')).toBeTruthy()
        expect(isFile('awd/asasd/sds.png')).toBeTruthy()
        done()
      })
  })

  it('should rm files', function(done) {
    request(app)
      .post('/?force=true')
      .attach('0', makeFixture('img.png'))
      .attach('1', makeFixture('img.png'), { filepath: '/awd/asasd/sds.png' })
      .expect(200)
      .end((err, res) => {
        expect(res.body).toEqual({
          code: 200,
          data: ['/img.png', '/awd/asasd/sds.png']
        })

        expect(isFile('img.png')).toBeTruthy()
        expect(isFile('awd/asasd/sds.png')).toBeTruthy()

        request(app)
          .delete('/')
          .expect(200)
          .end((err, res) => {
            expect(err).toBeNull()
            expect(res.body).toEqual({
              code: 200,
              data: '/'
            })

            expect(isFile('img.png')).toBeFalsy()
            expect(isFile('awd/asasd/sds.png')).toBeFalsy()
            done()
          })
      })
  })

  it('should token failed', function(done) {
    request(app)
      .post('/token/')
      .attach('0', makeFixture('img.png'))
      .attach('1', makeFixture('img.png'), { filepath: '/awd/asasd/sds.png' })
      .end((err, res) => {

        expect(res.body).toEqual({
          code: 502,
          message: 'auth-failed'
        })
        done()
      })
  })

  it('should token passed', function(done) {
    request(app)
      .post('/token/hahah')
      .set('authorization', 'fake_token')
      .attach('0', makeFixture('img.png'))
      .attach('1', makeFixture('img.png'), { filepath: 'sasd/sds.png' })
      .end((err, res) => {
        expect(res.status).toBe(200)
        expect(res.body).toEqual({
          code: 200,
          data: ['/hahah/img.png', '/hahah/sasd/sds.png']
        })

        expect(isFile('hahah/img.png')).toBeTruthy()
        expect(isFile('hahah/sasd/sds.png')).toBeTruthy()
        done()
      })
  })

  it('should fail when force is false', function(done) {
    let req = () =>
      request(app)
        .post('/token/noForce')
        .set('authorization', 'fake_token')
        .attach('1', makeFixture('img.png'), { filepath: 'sds.png' })

    req().end((err, res) => {
      expect(res.body).toEqual({
        code: 200,
        data: ['/noForce/sds.png']
      })

      expect(isFile('noForce/sds.png')).toBeTruthy()

      req().end((err, res) => {
        expect(res.body).toEqual({
          code: 502,
          message: 'Touch file: /noForce/sds.png failed, because the file has already existed, please set `force` to overwrite it.'
        })

        done()
      })
    })
  })

  it('should decompress', function(done) {
    request(app)
      .post('/token/zip?decompress=true&force=true')
      .set('authorization', 'fake_token')
      .attach('1', makeFixture('a.zip'))
      .end((err, res) => {
        expect(res.body).toEqual({
          code: 200,
          data: ["/zip/FileMan.js", "/zip/decompress.js", "/zip/filemanRouter.js", "/zip/你好.js"]
        })

        expect(isFile('zip/你好.js')).toBeTruthy()
        expect(isFile('zip/filemanRouter.js')).toBeTruthy()
        expect(isFile('zip/FileMan.js')).toBeTruthy()
        done()
      })
  })

  it('should fail when filepath backward', function(done) {
    let req = () =>
      request(app)
        .post('/token/../../noForce?decompress=true')
        .set('authorization', 'fake_token')
        .attach('1', makeFixture('img.png'), { filepath: '../../sds.png' })

    req().end((err, res) => {
      expect(res.body.code).toEqual(502)
      expect(res.body.message).toMatch(/Fileman forbids path /)

      done()
    })
  })
})
